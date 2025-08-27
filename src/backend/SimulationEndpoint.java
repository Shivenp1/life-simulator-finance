package src.backend;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.OutputStream;
import java.net.URI;
import java.util.*;

public class SimulationEndpoint implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        // Allow calls from a separate frontend (e.g., Next.js on port 3000)
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");

        if (!exchange.getRequestMethod().equalsIgnoreCase("GET")) {
            exchange.sendResponseHeaders(405, -1);
            return;
        }

        // ---- inputs (with defaults) ----
        Map<String, String> q = parseQuery(exchange.getRequestURI());
        int months = parseInt(q.get("months"), 120);
        double startingCash = parseDouble(q.get("startingCash"), 30000);
        double monthlyInvest = parseDouble(q.get("monthlyInvest"), 400);
        double returnAnnual = parseDouble(q.get("returnAnnual"), 6.0);

        double loanBalance = parseDouble(q.get("loanBalance"), 0);
        double loanRateAnnual = parseDouble(q.get("loanRateAnnual"), 0);
        double loanMinPayment = parseDouble(q.get("loanMinPayment"), 0);
        double loanExtraPayment = parseDouble(q.get("loanExtraPayment"), 0);

        // ---- simulation state ----
        double cash = startingCash;
        double portfolio = 0.0;
        double rMonthly = (returnAnnual / 100.0) / 12.0;

        double loanBal = loanBalance;
        double loanRMonthly = (loanRateAnnual / 100.0) / 12.0;

        int mid = Math.max(1, months / 2);
        double cashMid = 0, portMid = 0, loanMid = 0, netMid = 0;

        List<Monthly> series = new ArrayList<>(months);

        // ---- monthly loop ----
        for (int m = 1; m <= months; m++) {
            // invest
            portfolio = portfolio * (1 + rMonthly) + monthlyInvest;
            cash -= monthlyInvest;

            // loan
            if (loanBal > 0 && (loanMinPayment > 0 || loanExtraPayment > 0)) {
                double interest = loanBal * loanRMonthly;
                double scheduled = loanMinPayment + loanExtraPayment;
                double payment = Math.min(loanBal + interest, scheduled);
                double principal = Math.max(0, payment - interest);
                loanBal = Math.max(0, loanBal - principal);
                cash -= payment;
            }

            double netWorth = cash + portfolio - loanBal;

            if (m == mid) {
                cashMid = cash; portMid = portfolio; loanMid = loanBal; netMid = netWorth;
            }

            series.add(new Monthly(m, round2num(cash), round2num(portfolio), round2num(loanBal), round2num(netWorth)));
        }

        double finalCash = series.get(series.size()-1).cash;
        double finalPort = series.get(series.size()-1).portfolio;
        double finalDebt = series.get(series.size()-1).debt;
        double finalNet  = series.get(series.size()-1).netWorth;

        // ---- build JSON (manually) ----
        StringBuilder monthlyJson = new StringBuilder("\"monthly\":[");
        for (int i = 0; i < series.size(); i++) {
            Monthly p = series.get(i);
            if (i > 0) monthlyJson.append(",");
            monthlyJson.append("{")
                .append("\"month\":").append(p.month).append(",")
                .append("\"cash\":").append(p.cash).append(",")
                .append("\"portfolio\":").append(p.portfolio).append(",")
                .append("\"debt\":").append(p.debt).append(",")
                .append("\"netWorth\":").append(p.netWorth)
                .append("}");
        }
        monthlyJson.append("]");

        StringBuilder json = new StringBuilder();
        json.append("{")
            .append("\"inputs\":{")
                .append("\"months\":").append(months).append(",")
                .append("\"startingCash\":").append(round2num(startingCash)).append(",")
                .append("\"monthlyInvest\":").append(round2num(monthlyInvest)).append(",")
                .append("\"returnAnnual\":").append(round2num(returnAnnual)).append(",")
                .append("\"loanBalance\":").append(round2num(loanBalance)).append(",")
                .append("\"loanRateAnnual\":").append(round2num(loanRateAnnual)).append(",")
                .append("\"loanMinPayment\":").append(round2num(loanMinPayment)).append(",")
                .append("\"loanExtraPayment\":").append(round2num(loanExtraPayment))
            .append("},")
            .append("\"checkpoints\":{")
                .append("\"mid\":{")
                    .append("\"month\":").append(mid).append(",")
                    .append("\"cash\":").append(round2num(cashMid)).append(",")
                    .append("\"portfolio\":").append(round2num(portMid)).append(",")
                    .append("\"debt\":").append(round2num(loanMid)).append(",")
                    .append("\"netWorth\":").append(round2num(netMid))
                .append("},")
                .append("\"final\":{")
                    .append("\"month\":").append(months).append(",")
                    .append("\"cash\":").append(finalCash).append(",")
                    .append("\"portfolio\":").append(finalPort).append(",")
                    .append("\"debt\":").append(finalDebt).append(",")
                    .append("\"netWorth\":").append(finalNet)
                .append("}")
            .append("},")
            .append(monthlyJson).append(",")
            .append("\"summary\":\"After ").append(months).append(" months, net worth is $")
                .append(round2(finalNet))
                .append(" with $").append(round2(finalPort))
                .append(" invested and $").append(round2(finalDebt))
                .append(" debt remaining (")
                .append(round2(monthlyInvest)).append("/mo at ")
                .append(round2(returnAnnual)).append("% annual).\"")
        .append("}");

        byte[] body = json.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json; charset=utf-8");
        exchange.sendResponseHeaders(200, body.length);
        try (OutputStream os = exchange.getResponseBody()) { os.write(body); }
    }

    // ---- helpers ----
    private static Map<String,String> parseQuery(URI uri) {
        Map<String,String> map = new HashMap<>();
        String raw = uri.getQuery();
        if (raw == null || raw.isEmpty()) return map;
        for (String pair : raw.split("&")) {
            String[] kv = pair.split("=", 2);
            if (kv.length == 2) map.put(decode(kv[0]), decode(kv[1]));
            else if (kv.length == 1) map.put(decode(kv[0]), "");
        }
        return map;
    }
    private static String decode(String s) {
        try { return java.net.URLDecoder.decode(s, java.nio.charset.StandardCharsets.UTF_8); }
        catch (Exception e) { return s; }
    }
    private static int parseInt(String s, int def) {
        try { return Integer.parseInt(s); } catch (Exception e) { return def; }
    }
    private static double parseDouble(String s, double def) {
        try { return Double.parseDouble(s); } catch (Exception e) { return def; }
    }
    private static String round2(double x) {
        return String.format(java.util.Locale.US, "%.2f", x);
    }
    private static double round2num(double x) {
        return Math.round(x * 100.0) / 100.0;
    }
}
