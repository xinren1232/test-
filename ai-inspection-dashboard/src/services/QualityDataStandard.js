/**
 * �������ݱ�׼������
 */

export const EVENT_TYPES = {
  QUALITY_ISSUE: 'quality_issue',
  INSPECTION: 'inspection',
  DEVIATION: 'deviation',
  COMPLAINT: 'complaint',
  AUDIT: 'audit'
};

export class QualityDataStandard {
  constructor() {
    this.eventTypes = EVENT_TYPES;
    this.qualityService = null;
    this.initialized = false;
  }

  async initialize(qualityService) {
    this.qualityService = qualityService;
    this.initialized = true;
    return true;
  }

  getEventTypes() {
    return this.eventTypes;
  }

  // �����������ݱ�׼������
}

export default QualityDataStandard;
