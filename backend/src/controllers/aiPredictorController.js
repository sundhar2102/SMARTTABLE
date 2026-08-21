import { queryAll, queryGet } from '../../database/db.js';

export const predictWalkIn = async (req, res) => {
  try {
    const { restaurantId, partySize = 2, targetTime = '19:30', dayType = 'today', weather = 'sunny' } = req.body;

    const rest = await queryGet('SELECT * FROM restaurants WHERE id = ?', [restaurantId]);
    if (!rest) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const tables = await queryAll('SELECT * FROM `tables` WHERE restaurant_id = ?', [restaurantId]);
    const freeTables = tables.filter(t => t.status === 'available');

    let baseScore = rest.ai_walk_in_prob;

    // Party size penalty
    const pSize = Number(partySize);
    if (pSize >= 6) baseScore -= 25;
    else if (pSize >= 4) baseScore -= 12;
    else if (pSize === 1 || pSize === 2) baseScore += 10;

    // Time modifier
    const hour = parseInt(targetTime.split(':')[0], 10);
    if (hour >= 19 && hour <= 20) baseScore -= 20;
    else if (hour < 18 || hour >= 21) baseScore += 15;

    // Weather impact
    if (weather === 'rainy') baseScore -= 10;

    const finalScore = Math.max(12, Math.min(98, Math.round(baseScore)));

    let chanceLabel = 'High Chance';
    let chanceColor = 'text-emerald-400';
    if (finalScore < 40) {
      chanceLabel = 'Low Chance (Prior Booking Recommended)';
      chanceColor = 'text-rose-400';
    } else if (finalScore < 70) {
      chanceLabel = 'Moderate Chance';
      chanceColor = 'text-amber-400';
    }

    const rationale = [];
    if (freeTables.length > 0) {
      rationale.push(`${freeTables.length} tables currently free in database.`);
    }
    if (pSize <= 2) {
      rationale.push('2-seater tables have high turnover rates (~20 min cycle).');
    } else {
      rationale.push(`Larger groups of ${pSize} require table merging or reservation.`);
    }

    if (weather === 'rainy') {
      rationale.push('Rainy weather reduces walk-in traffic by ~18% overall.');
    } else {
      rationale.push('Good weather increases patio section seat usage.');
    }

    res.json({
      success: true,
      data: {
        score: finalScore,
        label: chanceLabel,
        color: chanceColor,
        waitEstimate: finalScore > 75 ? 'No wait (0-5 min)' : finalScore > 45 ? '10 - 20 min' : '35+ min',
        rationale,
        bestWindow: hour < 19 ? '6:15 PM - 6:45 PM' : '8:45 PM - 9:15 PM'
      }
    });
  } catch (error) {
    console.error('Error in predictWalkIn:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
