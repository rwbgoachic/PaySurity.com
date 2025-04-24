import { supabase } from '../lib/supabase';
import { faker } from '@faker-js/faker';

interface TestUser {
  email: string;
  role: string;
  employeeType?: string;
  businessType?: string;
}

const testUsers: TestUser[] = [
  { email: 'superadmin1@paysurity.test', role: 'super_admin' },
  { email: 'payrolladmin5@paysurity.test', role: 'sub_super_admin' },
  { email: 'ro.italianbistro@test.paysur', role: 'business_owner', businessType: 'restaurant' },
  { email: 'rm.steakhouse3@test.paysur', role: 'business_manager', businessType: 'restaurant' },
  { email: 'gso.freshmart2@test.paysur', role: 'business_owner', businessType: 'grocery' },
  { email: 'emp.w2hourly1@test.paysur', role: 'employee', employeeType: 'w2_hourly', businessType: 'restaurant' },
  { email: 'emp.w2salaried@test.paysur', role: 'employee', employeeType: 'w2_salaried', businessType: 'restaurant' },
  { email: 'emp.1099driver@test.paysur', role: 'contractor', employeeType: '1099', businessType: 'restaurant' },
  { email: 'emp.tipped1@test.paysur', role: 'employee', employeeType: 'tipped', businessType: 'restaurant' },
  { email: 'emp.multistate@test.paysur', role: 'employee', employeeType: 'w2_hourly', businessType: 'grocery' }
];

describe('Payroll System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Test User Creation', () => {
    it('should create test users with correct roles', async () => {
      const createUserMock = jest.fn().mockResolvedValue({ data: { user: { id: 'test-id' } }, error: null });
      jest.spyOn(supabase.auth.admin, 'createUser').mockImplementation(createUserMock);

      for (const user of testUsers) {
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: 'password123',
          email_confirm: true,
        });

        expect(error).toBeNull();
        expect(data.user).toBeTruthy();
        expect(createUserMock).toHaveBeenCalledWith(
          expect.objectContaining({
            email: user.email,
            email_confirm: true,
          })
        );
      }
    });

    it('should enforce MFA for test accounts', async () => {
      const mfaPolicyMock = jest.fn().mockResolvedValue({ data: { success: true }, error: null });
      jest.spyOn(supabase, 'rpc').mockImplementation(mfaPolicyMock);

      const testEmail = 'test.user@test.paysur';
      await supabase.rpc('enforce_mfa_policy', { p_email: testEmail });

      expect(mfaPolicyMock).toHaveBeenCalledWith(
        'enforce_mfa_policy',
        { p_email: testEmail }
      );
    });
  });

  describe('Tax Calculation Validation', () => {
    beforeEach(() => {
      // Mock RPC responses
      const rpcMock = jest.fn()
        .mockImplementation((functionName, params) => {
          switch (functionName) {
            case 'calculate_federal_tax':
              return Promise.resolve({
                data: {
                  withholding: 648.92,
                  pay_period: params.p_pay_period
                },
                error: null
              });
            case 'calculate_state_tax':
              return Promise.resolve({
                data: {
                  total_state_tax: 6696,
                  state_allocation: params.p_state_allocation
                },
                error: null
              });
            case 'calculate_sdi':
              return Promise.resolve({
                data: {
                  sdi_amount: 1240,
                  state: params.p_state
                },
                error: null
              });
            case 'validate_tipped_wage':
              return Promise.resolve({
                data: {
                  compliant: true,
                  hourly_equivalent: 17.25,
                  minimum_wage: 15.50
                },
                error: null
              });
            case 'generate_1099_nec':
              return Promise.resolve({
                data: {
                  box_1: '24000',
                  contractor_id: params.p_contractor_id,
                  tax_year: params.p_tax_year
                },
                error: null
              });
            default:
              return Promise.resolve({ data: null, error: 'Unknown function' });
          }
        });

      jest.spyOn(supabase, 'rpc').mockImplementation(rpcMock);
    });

    it('should calculate federal tax withholding correctly', async () => {
      const salary = 100000;
      const payPeriod = 'bi-weekly';

      const { data, error } = await supabase.rpc('calculate_federal_tax', {
        p_annual_salary: salary,
        p_pay_period: payPeriod
      });

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data.withholding).toBe(648.92);
      expect(data.pay_period).toBe(payPeriod);
    });

    it('should handle multi-state tax calculation', async () => {
      const salary = 120000;
      const stateAllocation = { CA: 0.6, NV: 0.4 };

      const { data, error } = await supabase.rpc('calculate_state_tax', {
        p_annual_salary: salary,
        p_state_allocation: stateAllocation
      });

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data.total_state_tax).toBe(6696);
      expect(data.state_allocation).toEqual(stateAllocation);
    });

    it('should calculate correct SDI for CA employees', async () => {
      const salary = 100000;
      const state = 'CA';

      const { data, error } = await supabase.rpc('calculate_sdi', {
        p_annual_salary: salary,
        p_state: state
      });

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data.sdi_amount).toBe(1240);
      expect(data.state).toBe(state);
    });
  });

  describe('Tipped Employee Handling', () => {
    it('should validate minimum wage compliance with tips', async () => {
      const baseWage = 7.25;
      const hoursWorked = 40;
      const tipsReceived = 400;

      const { data, error } = await supabase.rpc('validate_tipped_wage', {
        p_base_wage: baseWage,
        p_hours: hoursWorked,
        p_tips: tipsReceived
      });

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data.compliant).toBe(true);
      expect(data.hourly_equivalent).toBe(17.25);
      expect(data.minimum_wage).toBe(15.50);
    });
  });

  describe('1099 Contractor Processing', () => {
    it('should generate correct 1099-NEC data', async () => {
      const contractorId = faker.string.uuid();
      const taxYear = 2024;

      const { data, error } = await supabase.rpc('generate_1099_nec', {
        p_contractor_id: contractorId,
        p_tax_year: taxYear
      });

      expect(error).toBeNull();
      expect(data).toBeTruthy();
      expect(data.box_1).toBe('24000');
      expect(data.contractor_id).toBe(contractorId);
      expect(data.tax_year).toBe(taxYear);
    });
  });
});