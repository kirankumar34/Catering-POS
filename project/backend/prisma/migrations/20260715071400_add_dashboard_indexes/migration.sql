-- CreateIndex
CREATE INDEX "Expense_date_idx" ON "public"."Expense"("date");

-- CreateIndex
CREATE INDEX "Expense_orderId_idx" ON "public"."Expense"("orderId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "public"."Order"("status");

-- CreateIndex
CREATE INDEX "Payment_paymentDate_idx" ON "public"."Payment"("paymentDate");

-- CreateIndex
CREATE INDEX "Payment_orderId_idx" ON "public"."Payment"("orderId");
