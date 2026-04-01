import { dbService } from "./database";
import { userService } from "./userService";
import { pricingService, PricingPlan } from "./appServices";
import toast from "react-hot-toast";

export interface Transaction {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  gateway: 'stripe' | 'sslcommerz';
  createdAt: string;
}

export const paymentService = {
  /**
   * Initiate Stripe Payment
   */
  async initiateStripe(userId: string, plan: PricingPlan) {
    // In a real app, this would call a backend endpoint to create a Stripe Checkout session
    console.log(`Initiating Stripe for user ${userId}, plan ${plan.name}`);
    
    // Mocking the process
    const transactionId = `stripe_${Date.now()}`;
    const transaction: Transaction = {
      id: transactionId,
      userId,
      planId: plan.id,
      amount: parseFloat(plan.price),
      currency: 'USD',
      status: 'pending',
      gateway: 'stripe',
      createdAt: new Date().toISOString()
    };

    await dbService.save('transactions', transactionId, transaction);

    // Simulate redirect to Stripe
    toast.loading('Redirecting to Stripe...', { duration: 2000 });
    
    return new Promise((resolve) => {
      setTimeout(async () => {
        // Simulate successful payment callback
        await this.handleSuccess(transactionId);
        resolve(true);
      }, 3000);
    });
  },

  /**
   * Initiate SSLCommerz Payment
   */
  async initiateSSLCommerz(userId: string, plan: PricingPlan) {
    console.log(`Initiating SSLCommerz for user ${userId}, plan ${plan.name}`);
    
    const transactionId = `ssl_${Date.now()}`;
    const transaction: Transaction = {
      id: transactionId,
      userId,
      planId: plan.id,
      amount: parseFloat(plan.price),
      currency: 'BDT',
      status: 'pending',
      gateway: 'sslcommerz',
      createdAt: new Date().toISOString()
    };

    await dbService.save('transactions', transactionId, transaction);

    toast.loading('Redirecting to SSLCommerz...', { duration: 2000 });

    return new Promise((resolve) => {
      setTimeout(async () => {
        await this.handleSuccess(transactionId);
        resolve(true);
      }, 3000);
    });
  },

  /**
   * Handle Successful Payment
   */
  async handleSuccess(transactionId: string) {
    const transaction = await dbService.getOne<Transaction>('transactions', transactionId, null);
    if (!transaction) return false;

    // Update transaction status
    await dbService.save('transactions', transactionId, { ...transaction, status: 'completed' });

    // Get the plan details
    const plans = await pricingService.getAll();
    const plan = plans.find(p => p.id === transaction.planId);
    
    if (plan) {
      // Update user plan and credits
      await userService.updatePlan(transaction.userId, plan.id, plan.credits);
      toast.success(`Successfully upgraded to ${plan.name}!`);
    }

    return true;
  }
};
