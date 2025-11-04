import express from "express";
import sql from "mssql";
import { authenticateToken, authorize } from "../middleware/auth.js";

const router = express.Router();

// ==================== GET ALL CLUBS ====================
router.get("/", async (req, res) => {
	try {
		const pool = req.app.get("dbPool");
		const result = await pool.request().query("SELECT * FROM Clubs");
		res.json({ success: true, clubs: result.recordset });
	} catch (error) {
		console.error("Get clubs error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch clubs",
		});
	}
});

// ==================== GET SINGLE CLUB ====================
router.get("/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const pool = req.app.get("dbPool");
		const result = await pool
			.request()
			.input("id", sql.Int, id)
			.query("SELECT * FROM Clubs WHERE id = @id");

		if (result.recordset.length === 0) {
			return res
				.status(404)
				.json({ success: false, message: "Club not found" });
		}

		res.json({ success: true, club: result.recordset[0] });
	} catch (error) {
		console.error("Get club error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch club",
		});
	}
});

// ==================== CREATE CLUB ====================
router.post("/", authenticateToken, authorize("admin"), async (req, res) => {
	try {
		const { name, description, club_email, faculty_coordinator_id } =
			req.body;

		if (!name || !club_email) {
			return res
				.status(400)
				.json({
					success: false,
					message: "Please provide name and club_email",
				});
		}

		const pool = req.app.get("dbPool");
		const result = await pool
			.request()
			.input("name", sql.NVarChar, name)
			.input("description", sql.NVarChar, description)
			.input("club_email", sql.NVarChar, club_email)
			.input("faculty_coordinator_id", sql.Int, faculty_coordinator_id)
			.query(`
        INSERT INTO Clubs (name, description, club_email, faculty_coordinator_id)
        OUTPUT INSERTED.*
        VALUES (@name, @description, @club_email, @faculty_coordinator_id)
      `);

		res.status(201).json({
			success: true,
			message: "Club created successfully",
			club: result.recordset[0],
		});
	} catch (error) {
		console.error("Create club error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to create club",
		});
	}
});

// ==================== UPDATE CLUB ====================
router.put(
	"/:id",
	authenticateToken,
	authorize("admin", "club_faculty", async (req) => {
		if (req.user.role === "admin") {
			return true;
		}

		if (req.user.role === "club_faculty") {
			const { id } = req.params;
			const pool = req.app.get("dbPool");
			const result = await pool
				.request()
				.input("id", sql.Int, id)
				.query(
					"SELECT faculty_coordinator_id FROM Clubs WHERE id = @id"
				);

			if (result.recordset.length === 0) {
				return false;
			}

			return result.recordset[0].faculty_coordinator_id === req.user.id;
		}

		return false;
	}),
	async (req, res) => {
		try {
			const { id } = req.params;
			const { name, description, club_email, faculty_coordinator_id } =
				req.body;

			const pool = req.app.get("dbPool");
			const result = await pool
				.request()
				.input("id", sql.Int, id)
				.input("name", sql.NVarChar, name)
				.input("description", sql.NVarChar, description)
				.input("club_email", sql.NVarChar, club_email)
				.input(
					"faculty_coordinator_id",
					sql.Int,
					faculty_coordinator_id
				).query(`
        UPDATE Clubs
        SET name = @name, description = @description, club_email = @club_email, faculty_coordinator_id = @faculty_coordinator_id
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

			if (result.recordset.length === 0) {
				return res
					.status(404)
					.json({ success: false, message: "Club not found" });
			}

			res.json({
				success: true,
				message: "Club updated successfully",
				club: result.recordset[0],
			});
		} catch (error) {
			console.error("Update club error:", error);
			res.status(500).json({
				success: false,
				message: "Failed to update club",
			});
		}
	}
);

// ==================== DELETE CLUB ====================
router.delete(
	"/:id",
	authenticateToken,
	authorize("admin"),
	async (req, res) => {
		try {
			const { id } = req.params;
			const pool = req.app.get("dbPool");
			const result = await pool
				.request()
				.input("id", sql.Int, id)
				.query("DELETE FROM Clubs WHERE id = @id");

			if (result.rowsAffected[0] === 0) {
				return res
					.status(404)
					.json({ success: false, message: "Club not found" });
			}

			res.json({ success: true, message: "Club deleted successfully" });
		} catch (error) {
			console.error("Delete club error:", error);
			res.status(500).json({
				success: false,
				message: "Failed to delete club",
			});
		}
	}
);

// ==================== ADD CLUB MEMBER ====================
router.post(
	"/:id/members",
	authenticateToken,
	authorize("admin", "club_faculty", async (req) => {
		if (req.user.role === "admin") {
			return true;
		}

		if (req.user.role === "club_faculty") {
			const { id } = req.params;
			const pool = req.app.get("dbPool");
			const result = await pool
				.request()
				.input("id", sql.Int, id)
				.query(
					"SELECT faculty_coordinator_id FROM Clubs WHERE id = @id"
				);

			if (result.recordset.length === 0) {
				return false;
			}

			return result.recordset[0].faculty_coordinator_id === req.user.id;
		}

		return false;
	}),
	async (req, res) => {
		try {
			const { id } = req.params;
			const { user_id, position } = req.body;

			if (!user_id) {
				return res
					.status(400)
					.json({
						success: false,
						message: "Please provide user_id",
					});
			}

			const pool = req.app.get("dbPool");
			await pool
				.request()
				.input("club_id", sql.Int, id)
				.input("user_id", sql.Int, user_id)
				.input("position", sql.NVarChar, position)
				.input("added_by", sql.Int, req.user.id)
				.query(
					"INSERT INTO ClubMembers (club_id, user_id, position, added_by) VALUES (@club_id, @user_id, @position, @added_by)"
				);

			res.status(201).json({
				success: true,
				message: "Club member added successfully",
			});
		} catch (error) {
			console.error("Add club member error:", error);
			res.status(500).json({
				success: false,
				message: "Failed to add club member",
			});
		}
	}
);

export default router;

// ==================== GET CLUB MEMBERS ====================
router.get("/:id/members", async (req, res) => {
	try {
		const { id } = req.params;
		const pool = req.app.get("dbPool");
		const result = await pool.request().input("id", sql.Int, id).query(`
        SELECT u.*, cm.position, cm.joined_date
        FROM ClubMembers cm
        JOIN Users u ON cm.user_id = u.id
        WHERE cm.club_id = @id
      `);

		res.json({ success: true, members: result.recordset });
	} catch (error) {
		console.error("Get club members error:", error);
	}
});

// ==================== REMOVE CLUB MEMBER ====================
router.delete(
	"/:id/members/:userId",
	authenticateToken,
	authorize("admin", "club_faculty", async (req) => {
		if (req.user.role === "admin") {
			return true;
		}

		if (req.user.role === "club_faculty") {
			const { id } = req.params;
			const pool = req.app.get("dbPool");
			const result = await pool
				.request()
				.input("id", sql.Int, id)
				.query(
					"SELECT faculty_coordinator_id FROM Clubs WHERE id = @id"
				);

			if (result.recordset.length === 0) {
				return false;
			}

			return result.recordset[0].faculty_coordinator_id === req.user.id;
		}

		return false;
	}),
	async (req, res) => {
		try {
			const { id, userId } = req.params;

			const pool = req.app.get("dbPool");
			const result = await pool
				.request()
				.input("club_id", sql.Int, id)
				.input("user_id", sql.Int, userId)
				.query(
					"DELETE FROM ClubMembers WHERE club_id = @club_id AND user_id = @user_id"
				);

			if (result.rowsAffected[0] === 0) {
				return res
					.status(404)
					.json({ success: false, message: "Club member not found" });
			}

			res.json({
				success: true,
				message: "Club member removed successfully",
			});
		} catch (error) {
			console.error("Remove club member error:", error);
			res.status(500).json({
				success: false,
				message: "Failed to remove club member",
			});
		}
	}
);
