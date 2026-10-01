export type CheckoutOrderView = {
  id: string;
  amountTotalCents: number;
  email: string | null;
  paid: boolean;
  processing: boolean;
  shippingEstimate: string;
};
