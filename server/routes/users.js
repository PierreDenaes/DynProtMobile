const express = require('express');
const router = express.Router();
const database = require('../database');

// Update user goal
router.put('/goal/:userId', async (req, res) => {
  console.log('Received goal update request:', { params: req.params, body: req.body });
  
  try {
    const { userId } = req.params;
    const { daily_protein_goal } = req.body;
    
    if (!daily_protein_goal || daily_protein_goal <= 0) {
      console.log('Invalid protein goal:', daily_protein_goal);
      return res.status(400).json({ error: 'Valid protein goal required' });
    }

    console.log(`Updating protein goal to ${daily_protein_goal} for user ${userId}`);
    
    const result = await database.query(
      `UPDATE user_profiles SET daily_protein_goal = $1 WHERE user_id = $2 RETURNING *`,
      [daily_protein_goal, userId]
    );

    console.log('Update result:', { rowCount: result.rowCount, rows: result.rows });

    if (result.rowCount === 0) {
      console.log('No user found with id:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = result.rows[0];
    console.log('Successfully updated user:', { userId, daily_protein_goal });

    res.json({
      success: true,
      message: 'Goal updated successfully',
      daily_protein_goal: updatedUser.daily_protein_goal
    });

  } catch (error) {
    console.error('Goal update error:', error);
    res.status(500).json({ 
      error: 'Failed to update goal',
      details: error.message
    });
  }
});

// Update user profile
router.put('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { prenom, age, poids, niveau_activite, objectif_principal } = req.body;
    
    const result = await database.query(
      `UPDATE user_profiles 
       SET prenom = $1, age = $2, poids = $3, niveau_activite = $4, objectif_principal = $5
       WHERE user_id = $6
       RETURNING *`,
      [prenom, age, poids, niveau_activite, objectif_principal, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
