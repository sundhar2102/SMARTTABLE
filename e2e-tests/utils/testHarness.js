
export class TestHarness {
  constructor(suiteName, category) {
    this.suiteName = suiteName;
    this.category = category;
    this.results = [];
  }

  async test(id, feature, description, role, type, assertionFn, detailsGen) {
    const startTime = Date.now();
    let status = 'PASS';
    let details = '';

    try {
      await assertionFn();
      details = detailsGen ? detailsGen() : 'Verified and asserted valid system state';
    } catch (err) {
      status = 'FAIL';
      details = `Assertion error: ${err.message}`;
    }

    const durationMs = Math.max(1, Date.now() - startTime);

    const record = {
      id,
      category: this.category,
      feature,
      description,
      role,
      type,
      status,
      durationMs,
      timestamp: new Date().toISOString(),
      details
    };

    this.results.push(record);
    return record;
  }

  getResults() {
    return this.results;
  }
}
