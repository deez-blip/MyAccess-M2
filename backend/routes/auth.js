import express from "express";
import { supabaseAdmin, supabase } from "../config/supabase.js";
import { authenticateToken } from "../middleware/auth.js";
import sql from "../config/db.js";
import { logAuditEvent } from "../services/auditLog.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { email, password, firstName, lastName, handicapType } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
          data: {
            first_name: firstName || null,
            last_name: lastName || null,
            handicap_type: handicapType || null,
          },
        },
      });

    if (authError) {
      let statusCode = 400;
      let errorMessage = authError.message;

      if (authError.message.includes("rate limit")) {
        statusCode = 429;
        errorMessage =
          "Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.";
      } else if (authError.message.includes("already registered")) {
        errorMessage = "Cet email est déjà utilisé. Essayez de vous connecter.";
      } else if (authError.message.includes("invalid")) {
        errorMessage = "Email invalide. Veuillez vérifier votre adresse email.";
      }

      return res.status(statusCode).json({ error: errorMessage });
    }

    if (!authData.user) {
      return res
        .status(400)
        .json({ error: "Erreur lors de la création du compte" });
    }

    const user = {
      id: authData.user.id,
      email: authData.user.email,
      firstName: authData.user.user_metadata?.first_name || null,
      lastName: authData.user.user_metadata?.last_name || null,
      handicapType: authData.user.user_metadata?.handicap_type || null,
    };

    try {
      const result = await sql`
        INSERT INTO users (id, email, first_name, last_name, handicap_type, created_at, updated_at)
        VALUES (
          ${authData.user.id},
          ${authData.user.email},
          ${authData.user.user_metadata?.first_name || null},
          ${authData.user.user_metadata?.last_name || null},
          ${authData.user.user_metadata?.handicap_type || null},
          NOW(),
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          handicap_type = EXCLUDED.handicap_type,
          updated_at = NOW()
        RETURNING id, email, first_name, last_name
      `;
      console.log("✅ User créé/mis à jour dans la DB:", result[0]);
    } catch (dbError) {
      console.error("❌ Erreur synchronisation DB:", dbError);
      console.error("Détails erreur:", {
        message: dbError.message,
        code: dbError.code,
        detail: dbError.detail,
        hint: dbError.hint,
        position: dbError.position,
      });
      return res.status(500).json({
        error: "Erreur lors de l'enregistrement en base de données",
        details: dbError.message,
      });
    }

    let session = null;
    if (authData.session) {
      session = {
        accessToken: authData.session.access_token,
        refreshToken: authData.session.refresh_token,
        expiresAt:
          authData.session.expires_at || Math.floor(Date.now() / 1000) + 3600,
      };
    } else {
      const { data: sessionData, error: sessionError } =
        await supabaseAdmin.auth.signInWithPassword({
          email,
          password,
        });

      if (sessionError || !sessionData.session) {
        console.error("❌ Erreur création session après signup:", sessionError);
        return res.status(500).json({
          error: "Compte créé mais erreur lors de la connexion automatique",
          message: "Veuillez vous connecter manuellement",
        });
      }

      session = {
        accessToken: sessionData.session.access_token,
        refreshToken: sessionData.session.refresh_token,
        expiresAt:
          sessionData.session.expires_at ||
          Math.floor(Date.now() / 1000) + 3600,
      };
    }

    await logAuditEvent({
      req,
      userId: authData.user.id,
      eventType: "signup",
      metadata: { email: authData.user.email },
    });

    res.status(201).json({
      message: "Compte créé avec succès",
      user,
      session,
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur lors de l'inscription" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }

    if (!authData.user || !authData.session) {
      return res.status(401).json({ error: "Erreur lors de la connexion" });
    }

    const session = {
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      expiresAt:
        authData.session.expires_at || Math.floor(Date.now() / 1000) + 3600,
    };

    const user = {
      id: authData.user.id,
      email: authData.user.email,
      firstName: authData.user.user_metadata?.first_name || null,
      lastName: authData.user.user_metadata?.last_name || null,
      handicapType: authData.user.user_metadata?.handicap_type || null,
    };

    try {
      const result = await sql`
        INSERT INTO users (id, email, first_name, last_name, handicap_type, created_at, updated_at)
        VALUES (
          ${authData.user.id},
          ${authData.user.email},
          ${authData.user.user_metadata?.first_name || null},
          ${authData.user.user_metadata?.last_name || null},
          ${authData.user.user_metadata?.handicap_type || null},
          NOW(),
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          handicap_type = EXCLUDED.handicap_type,
          updated_at = NOW()
        RETURNING id, email
      `;
      console.log("✅ User synchronisé dans la DB:", result[0]);
    } catch (dbError) {
      console.error("❌ Erreur synchronisation DB:", dbError);
      console.error("Détails erreur:", {
        message: dbError.message,
        code: dbError.code,
        detail: dbError.detail,
        hint: dbError.hint,
      });
    }

    await logAuditEvent({
      req,
      userId: authData.user.id,
      eventType: "login",
      metadata: { email: authData.user.email },
    });

    res.json({
      user,
      session,
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur lors de la connexion" });
  }
});

router.post("/logout", authenticateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await supabaseAdmin.auth.signOut({ refreshToken });
    }

    await logAuditEvent({
      req,
      userId: req.user.id,
      eventType: "logout",
    });

    res.json({ message: "Déconnexion réussie" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la déconnexion" });
  }
});

router.get("/me", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const dbUser = await sql`
      SELECT * FROM users WHERE id = ${userId}
    `;

    if (dbUser.length > 0) {
      const user = {
        id: dbUser[0].id,
        email: dbUser[0].email,
        firstName: dbUser[0].first_name,
        lastName: dbUser[0].last_name,
        handicapType: dbUser[0].handicap_type,
        createdAt: dbUser[0].created_at.toISOString(),
      };
      return res.json(user);
    }

    const { data: userData, error } =
      await supabaseAdmin.auth.admin.getUserById(userId);

    if (error || !userData.user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    const user = {
      id: userData.user.id,
      email: userData.user.email,
      firstName: userData.user.user_metadata?.first_name || null,
      lastName: userData.user.user_metadata?.last_name || null,
      handicapType: userData.user.user_metadata?.handicap_type || null,
      createdAt: userData.user.created_at,
    };

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.put("/me", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, handicapType, phone } = req.body;

    const updates = {};
    if (firstName !== undefined) updates.first_name = firstName;
    if (lastName !== undefined) updates.last_name = lastName;
    if (handicapType !== undefined) updates.handicap_type = handicapType;
    if (phone !== undefined) updates.phone = phone;

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        user_metadata: updates,
      },
    );

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    try {
      await sql`
        UPDATE users
        SET 
          first_name = ${
            updates.first_name !== undefined
              ? updates.first_name
              : sql`first_name`
          },
          last_name = ${
            updates.last_name !== undefined ? updates.last_name : sql`last_name`
          },
          handicap_type = ${
            updates.handicap_type !== undefined
              ? updates.handicap_type
              : sql`handicap_type`
          },
          phone = ${updates.phone !== undefined ? updates.phone : sql`phone`},
          updated_at = NOW()
        WHERE id = ${userId}
      `;
    } catch (dbError) {
      console.error("Erreur synchronisation DB:", dbError);
    }

    const dbUser = await sql`
      SELECT * FROM users WHERE id = ${userId}
    `;

    const user = {
      id: data.user.id,
      email: data.user.email,
      firstName:
        dbUser[0]?.first_name || data.user.user_metadata?.first_name || null,
      lastName:
        dbUser[0]?.last_name || data.user.user_metadata?.last_name || null,
      handicapType:
        dbUser[0]?.handicap_type ||
        data.user.user_metadata?.handicap_type ||
        null,
      createdAt: dbUser[0]?.created_at?.toISOString() || data.user.created_at,
    };

    await logAuditEvent({
      req,
      userId,
      eventType: "profile_update",
      metadata: { updatedFields: Object.keys(updates) },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({
      error: "Erreur serveur lors de la mise à jour",
    });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token requis" });
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.refreshSession({
        refresh_token: refreshToken,
      });

    if (authError || !authData.session) {
      return res
        .status(401)
        .json({ error: "Refresh token invalide ou expiré" });
    }

    const session = {
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
      expiresAt:
        authData.session.expires_at || Math.floor(Date.now() / 1000) + 3600,
    };

    res.json(session);
  } catch (error) {
    res.status(500).json({
      error: "Erreur serveur lors du rafraîchissement",
    });
  }
});

router.get("/me/reviews", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch user's reviews joined with center informations
    const reviews = await sql`
      SELECT 
        r.id,
        r.place_id,
        r.user_id,
        r.comment,
        r.rating,
        r.items,
        r.created_at,
        r.updated_at,
        u.email,
        NULLIF(TRIM(CONCAT_WS(' ', u.first_name, u.last_name)), '') AS user_name,
        json_build_object(
          'id', hp.id,
          'name', hp.name,
          'address', hp.address,
          'city', hp.city || ' ' || hp.postal_code || ' ' || hp.region,
          'type', hp.establishment_activities
        ) as center
      FROM healthcare_place_reviews r
      LEFT JOIN users u ON u.id = r.user_id
      JOIN healthcare_places hp ON hp.id = r.place_id
      WHERE r.user_id = ${userId}
      ORDER BY r.created_at DESC
    `;

    const formattedReviews = reviews.map((review) => {
      const rating = Number(review.rating || 5);
      const items = Array.isArray(review.items) ? review.items : [];
      const placeId = review.place_id;
      const handicapTypes = Array.from(
        new Set(
          items.flatMap((item) =>
            Array.isArray(item.handicapTypes) ? item.handicapTypes : [],
          ),
        ),
      );

      return {
        id: String(review.id),
        userId: String(review.user_id),
        userName: review.user_name || review.email || "Utilisateur",
        centerId: `healthcare:${placeId}`,
        date: review.created_at?.toISOString?.() || review.created_at,
        scores: {
          physique: rating,
          numerique: rating,
          accueil: rating,
        },
        comment: review.comment || "",
        handicapTypes,
        helpfulCount: 0,
        accessibilityItems: items,
        center: review.center,
      };
    });

    res.json(formattedReviews);
  } catch (error) {
    console.error("Erreur lors de la récupération des avis:", error);
    res
      .status(500)
      .json({ error: "Erreur serveur lors de la récupération de vos avis" });
  }
});

export default router;
