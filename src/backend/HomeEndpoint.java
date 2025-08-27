package src.backend;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.io.OutputStream;

public class HomeEndpoint implements HttpHandler {
    @Override
    public void handle(HttpExchange ex) throws IOException {
        String msg = """
                Welcome to the Life Simulator API!

                Try:
                /simulate?months=120&startingCash=30000&monthlyInvest=400&returnAnnual=6\
                &loanBalance=20000&loanRateAnnual=5&loanMinPayment=220&loanExtraPayment=0

                Query params:
                  - months (int)
                  - startingCash (double)
                  - monthlyInvest (double)
                  - returnAnnual (double, %)
                  - loanBalance (double)
                  - loanRateAnnual (double, %)
                  - loanMinPayment (double)
                  - loanExtraPayment (double)
                """;
        ex.getResponseHeaders().add("Content-Type", "text/plain; charset=utf-8");
        byte[] body = msg.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        ex.sendResponseHeaders(200, body.length);
        try (OutputStream os = ex.getResponseBody()) { os.write(body); }
    }
}
