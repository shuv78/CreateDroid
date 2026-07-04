/* ============================================================
   Feature: Payment
   bKash/Nagad/Stripe payment form with amount input, merchant number
   ============================================================ */

window.Feature_payment = {
    render: function() {
        return '' +
            '<div style="flex:1;display:flex;flex-direction:column;padding:var(--space-md);">' +
                '<div style="text-align:center;padding:var(--space-md) 0;">' +
                    '<div style="font-size:48px;margin-bottom:8px;">&#x1F4B3;</div>' +
                    '<h3 style="font-size:var(--font-size-title2);font-weight:700;color:var(--color-text);">' + App.t('payment.title') + '</h3>' +
                '</div>' +

                // Amount
                '<div class="input-group">' +
                    '<label for="payment-amount">' + App.t('payment.amount') + ' <span style="color:var(--color-error);">*</span></label>' +
                    '<input type="number" id="payment-amount" class="input-field" placeholder="' + App.t('payment.amountPlaceholder') + '" min="1" step="1" />' +
                '</div>' +

                // Merchant Number
                '<div class="input-group">' +
                    '<label for="payment-merchant">' + App.t('payment.merchantNumber') + ' <span style="color:var(--color-error);">*</span></label>' +
                    '<input type="text" id="payment-merchant" class="input-field" placeholder="' + App.t('payment.merchantPlaceholder') + '" />' +
                '</div>' +

                // Payment Method
                '<div class="input-group">' +
                    '<label>' + App.t('payment.method') + '</label>' +
                    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
                        '<button class="payment-method-btn active" data-method="bkash" style="padding:12px;border-radius:var(--radius-sm);border:2px solid var(--color-primary);background:var(--color-primary-light);color:var(--color-primary);font-weight:600;cursor:pointer;">' + App.t('payment.bKash') + '</button>' +
                        '<button class="payment-method-btn" data-method="nagad" style="padding:12px;border-radius:var(--radius-sm);border:1px solid var(--color-border);background:var(--color-bg-input);color:var(--color-text-secondary);cursor:pointer;font-weight:500;">' + App.t('payment.nagad') + '</button>' +
                        '<button class="payment-method-btn" data-method="stripe" style="padding:12px;border-radius:var(--radius-sm);border:1px solid var(--color-border);background:var(--color-bg-input);color:var(--color-text-secondary);cursor:pointer;font-weight:500;">' + App.t('payment.stripe') + '</button>' +
                        '<button class="payment-method-btn" data-method="rocket" style="padding:12px;border-radius:var(--radius-sm);border:1px solid var(--color-border);background:var(--color-bg-input);color:var(--color-text-secondary);cursor:pointer;font-weight:500;">' + App.t('payment.rocket') + '</button>' +
                    '</div>' +
                '</div>' +

                // Error
                '<div id="payment-error" style="display:none;padding:12px;background:rgba(218,54,51,0.1);border:1px solid rgba(218,54,51,0.3);border-radius:var(--radius-sm);margin-bottom:var(--space-md);color:var(--color-error);font-size:var(--font-size-footnote);"></div>' +

                // Pay button
                '<button id="payment-pay-btn" class="btn btn-primary" style="width:100%;font-size:var(--font-size-body);">' + App.t('payment.payButton') + '</button>' +

                '<p style="text-align:center;padding:var(--space-md);font-size:var(--font-size-footnote);color:var(--color-text-medium);">' +
                    'Secure payment via SSL/TLS' +
                '</p>' +
            '</div>';
    },
    init: function() {
        var selectedMethod = 'bkash';
        var amountInput = document.getElementById('payment-amount');
        var merchantInput = document.getElementById('payment-merchant');
        var errorDiv = document.getElementById('payment-error');
        var payBtn = document.getElementById('payment-pay-btn');

        // Payment method selection
        document.querySelectorAll('.payment-method-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.payment-method-btn').forEach(function(b) {
                    b.style.border = '1px solid var(--color-border)';
                    b.style.background = 'var(--color-bg-input)';
                    b.style.color = 'var(--color-text-secondary)';
                    b.style.fontWeight = '500';
                });
                btn.style.border = '2px solid var(--color-primary)';
                btn.style.background = 'var(--color-primary-light)';
                btn.style.color = 'var(--color-primary)';
                btn.style.fontWeight = '600';
                selectedMethod = btn.getAttribute('data-method');
            });
        });

        // Pay action
        if (payBtn) {
            payBtn.addEventListener('click', function() {
                if (errorDiv) errorDiv.style.display = 'none';

                var amount = amountInput ? parseFloat(amountInput.value) : 0;
                var merchant = merchantInput ? merchantInput.value.trim() : '';

                if (!amount || amount <= 0) {
                    showError(App.t('payment.enterAmount'));
                    return;
                }
                if (!merchant) {
                    showError(App.t('payment.enterMerchant'));
                    return;
                }

                payBtn.disabled = true;
                payBtn.textContent = App.t('payment.processing');

                // Simulate payment
                setTimeout(function() {
                    Utils.showSuccess(Utils.formatBDT(amount) + ' ' + App.t('payment.success') + ' (' + selectedMethod.toUpperCase() + ')');
                    payBtn.disabled = false;
                    payBtn.textContent = App.t('payment.payButton');
                    if (amountInput) amountInput.value = '';
                    if (merchantInput) merchantInput.value = '';
                }, 1500);
            });
        }

        function showError(msg) {
            if (errorDiv) {
                errorDiv.textContent = msg;
                errorDiv.style.display = 'block';
            } else {
                Utils.showErrorToast(msg);
            }
        }
    },
    destroy: function() {}
};
