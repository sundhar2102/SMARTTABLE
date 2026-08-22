import { queryAll, queryGet } from '../../database/db.js';

export const predictWalkIn = async (req, res) => {
  try {
    const { restaurantId, partySize = 2, targetTime = '19:30', dayType = 'today', weather = 'sunny' } = req.body;

    if (!restaurantId) {
      return res.status(400).json({ success: false, message: 'Restaurant ID is required' });
    }

    const rest = await queryGet('SELECT * FROM restaurants WHERE id = ?', [restaurantId]);
    if (!rest) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const tables = await queryAll('SELECT * FROM `tables` WHERE restaurant_id = ?', [restaurantId]);
    const totalTables = tables.length;
    const freeTables = tables.filter(t => t.status === 'available');
    const matchingCapacityTables = tables.filter(t => t.capacity >= Number(partySize));
    const matchingFreeTables = matchingCapacityTables.filter(t => t.status === 'available');

    // Query actual bookings for today around the target time (+/- 1 hour)
    const hour = parseInt(targetTime.split(':')[0], 10) || 19;
    const windowStart = `${String(Math.max(0, hour - 1)).padStart(2, '0')}:00:00`;
    const windowEnd = `${String(Math.min(23, hour + 1)).padStart(2, '0')}:59:59`;

    const conflictingBookings = await queryGet(`
      SELECT COUNT(*) as count 
      FROM reservations 
      WHERE restaurant_id = ? 
        AND reservation_date = CURDATE() 
        AND reservation_time BETWEEN ? AND ?
        AND status = 'Confirmed'
    `, [restaurantId, windowStart, windowEnd]);
    const activeBookingsInSlot = Number(conflictingBookings?.count || 0);

    let baseScore = Number(rest.ai_walk_in_prob || 65);

    // Free table impact
    if (matchingFreeTables.length > 0) {
      baseScore += (matchingFreeTables.length * 8);
    } else {
      baseScore -= 18;
    }

    // Party size modifier
    const pSize = Number(partySize);
    if (pSize >= 6) baseScore -= 20;
    else if (pSize >= 4) baseScore -= 10;
    else if (pSize === 1 || pSize === 2) baseScore += 8;

    // Time slot & reservation pressure modifier
    if (activeBookingsInSlot >= Math.ceil(totalTables * 0.5)) {
      baseScore -= 22; // heavy reservation load in that window
    } else if (activeBookingsInSlot === 0) {
      baseScore += 10;
    }

    // Prime dining hours
    if (hour >= 19 && hour <= 21) {
      baseScore -= 15;
    } else if (hour < 18 || hour >= 22) {
      baseScore += 12;
    }

    // Weather impact
    if (weather === 'rainy') {
      baseScore -= 8;
    }

    const finalScore = Math.max(10, Math.min(98, Math.round(baseScore)));

    let chanceLabel = 'High Walk-in Probability';
    let chanceColor = 'text-emerald-400';
    if (finalScore < 40) {
      chanceLabel = 'Low Chance (Table Booking Strongly Advised)';
      chanceColor = 'text-rose-400';
    } else if (finalScore < 70) {
      chanceLabel = 'Moderate Chance';
      chanceColor = 'text-amber-400';
    }

    const rationale = [];
    if (matchingFreeTables.length > 0) {
      rationale.push(`${matchingFreeTables.length} tables matching your ${pSize}-guest party are currently vacant.`);
    } else if (freeTables.length > 0) {
      rationale.push(`${freeTables.length} total tables vacant; larger party size may require table joining.`);
    } else {
      rationale.push(`All ${totalTables} tables currently in service; walk-ins must wait for next table release.`);
    }

    if (activeBookingsInSlot > 0) {
      rationale.push(`${activeBookingsInSlot} pre-confirmed bookings scheduled around ${targetTime}.`);
    } else {
      rationale.push(`No conflicting reservations in the ${windowStart.slice(0,5)} - ${windowEnd.slice(0,5)} window.`);
    }

    if (pSize <= 2) {
      rationale.push('2-seater tables have fast ~25 min average dining cycle.');
    } else {
      rationale.push(`Parties of ${pSize} have an average ~50 min dining duration.`);
    }

    res.json({
      success: true,
      data: {
        score: finalScore,
        label: chanceLabel,
        color: chanceColor,
        waitEstimate: finalScore > 75 ? 'No wait (0 - 5 min)' : finalScore > 45 ? '10 - 20 min' : '30 - 45 min',
        rationale,
        bestWindow: hour < 19 ? '5:30 PM - 6:30 PM' : '9:15 PM - 10:00 PM',
        isDeterministic: true
      }
    });
  } catch (error) {
    console.error('Error in predictWalkIn:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
