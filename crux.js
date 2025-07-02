
import { CruxPipeline, CruxContext, OrderSchemaValidatorMind, ProductAvailabilityMind, CustomerEligibilityMind, OrderRoutingMind, OrderSummaryMind } from './index.js';

document.addEventListener('DOMContentLoaded', () => {
    const orderInput = document.getElementById('orderInput');
    const processButton = document.getElementById('processButton');
    const outputDiv = document.getElementById('output');

    if (!orderInput || !processButton || !outputDiv) {
        console.error('Required DOM elements not found.');
        return;
    }

    // Initialize the CruxPipeline with our custom Minds
    const orderProcessingPipeline = new CruxPipeline(
        [
            new OrderSchemaValidatorMind(),
            new ProductAvailabilityMind(),
            new CustomerEligibilityMind(),
            new OrderRoutingMind(),
            new OrderSummaryMind(),
        ]
    );

    processButton.addEventListener('click', async () => {
        outputDiv.innerHTML = ''; // Clear previous output
        let orderData;
        try {
            orderData = JSON.parse(orderInput.value);
            outputDiv.innerHTML += '<p><strong>Input Order:</strong></p><pre>' + JSON.stringify(orderData, null, 2) + '</pre><hr>';
        } catch (e) {
            outputDiv.innerHTML = '<p style="color: red;">Invalid JSON input. Please enter a valid JSON object.</p>';
            return;
        }

        const context = new CruxContext(orderData);

        try {
            const finalResult = await orderProcessingPipeline.process(context);

            outputDiv.innerHTML += '<p><strong>Pipeline Execution Trace:</strong></p>';
            context.getTrace().forEach(traceEntry => {
                outputDiv.innerHTML += `
                    <div style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; border-radius: 5px;">
                        <p><strong>Mind:</strong> ${traceEntry.mind}</p>
                        <p><strong>Input:</strong> <pre>${JSON.stringify(traceEntry.input, null, 2)}</pre></p>
                        <p><strong>Output:</strong> <pre>${JSON.stringify(traceEntry.output, null, 2)}</pre></p>
                        <p><strong>Timestamp:</strong> ${new Date(traceEntry.timestamp).toLocaleTimeString()}</p>
                    </div>
                `;
            });

            outputDiv.innerHTML += '<hr><p><strong>Final Pipeline Result:</strong></p><pre>' + JSON.stringify(finalResult, null, 2) + '</pre>';

        } catch (error) {
            outputDiv.innerHTML += '<p style="color: red;">An error occurred during pipeline processing:</p><pre>' + error.message + '</pre>';
            if (error.trace) {
                outputDiv.innerHTML += '<p><strong>Error Trace:</strong></p><pre>' + JSON.stringify(error.trace, null, 2) + '</pre>';
            }
        }
    });

    // Set a default example order
    orderInput.value = JSON.stringify({
        orderId: "ORD789",
        productId: "PROD001",
        quantity: 5,
        customerId: "CUST001"
    }, null, 2);
});
