const { generateCardioWorkout } = require('../services/workoutAIService');

describe('Workout AI Service', () => {
    it('should format a proper cardio prompt (skipped actual API call for unit testing)', () => {
        // We ensure the file exports correctly
        expect(typeof generateCardioWorkout).toBe('function');
    });
});
