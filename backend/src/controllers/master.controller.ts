import { BaseController } from './base.controller.js';

export class AreaController extends BaseController {
  constructor() {
    super('area_master', 'area_id');
  }
}

export class CustomerController extends BaseController {
  constructor() {
    super('customer_master', 'customer_id');
  }
}

export class GSTController extends BaseController {
  constructor() {
    super('gst_master', 'gst_id');
  }
}

export class ProductController extends BaseController {
  constructor() {
    super('product_master', 'product_id');
  }
}

export class PricingController extends BaseController {
  constructor() {
    super('pricing_master', 'pricing_id');
  }
}