package src.backend;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.io.OutputStream;

public class HomeEndpoint implements HttpHandler {
    @Override
    public void handle(HttpExchange ex) throws IOException {
        // CORS
        ex.getResponseHeaders().add("Access-Control-Allow-Origin", "http://localhost:3000");
        ex.getResponseHeaders().add("Vary", "Origin");
        ex.getResponseHeaders().add("Access-Control-Allow-Methods", "GET,OPTIONS");
        ex.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

        // Handle preflight
        if (ex.getRequestMethod().equalsIgnoreCase("OPTIONS")) {
            ex.sendResponseHeaders(204, -1);
            return;
        }

        String msg = """
                Welcome to the Life Event Financial Simulator API!

                This simulator shows how major life purchases (house, car, education) 
                cascade and affect your ability to invest and build wealth.

                Try this example with all 3 life events:
                /simulate?months=120&startingCash=50000&monthlyInvest=500&returnAnnual=7&salaryAnnual=70000&monthlyExpenses=2000&houseBuyMonth=12&homePrice=350000&carBuyMonth=24&carPrice=30000&collegeStartMonth=36&studentLoanAmount=50000

                Basic Parameters:
                  - months (int): Simulation length
                  - startingCash (double): Initial cash
                  - monthlyInvest (double): Monthly investment
                  - returnAnnual (double, %): Investment return
                  - salaryAnnual (double): Yearly gross income
                  - monthlyExpenses (double): Base monthly expenses

                Life Event Parameters:
                  - houseBuyMonth (int): When to buy house (0 = never)
                  - homePrice (double): House price
                  - downPaymentPercent (double): Down payment %
                  - mortgageRate (double): Mortgage interest rate %
                  
                  - carBuyMonth (int): When to buy car (0 = never)
                  - carPrice (double): Car price
                  - carDownPaymentPercent (double): Car down payment %
                  - carLoanRate (double): Car loan interest rate %
                  - carLoanYears (int): Car loan term in years
                  
                  - collegeStartMonth (int): When to start college (0 = never)
                  - studentLoanAmount (double): Student loan amount
                  - studentLoanRate (double): Student loan interest rate %
                  - studentLoanYears (int): Student loan term in years

                The system provides smart recommendations based on your income!
                """;
        ex.getResponseHeaders().add("Content-Type", "text/plain; charset=utf-8");
        byte[] body = msg.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        ex.sendResponseHeaders(200, body.length);
        try (OutputStream os = ex.getResponseBody()) { os.write(body); }
    }
}
