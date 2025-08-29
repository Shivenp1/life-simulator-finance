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
        
        // ---- NEW: Core Life Event Parameters ----
        double salaryAnnual = parseDouble(q.get("salaryAnnual"), 60000);
        double monthlyExpenses = parseDouble(q.get("monthlyExpenses"), 2000);
        
        // House Event
        int houseBuyMonth = parseInt(q.get("houseBuyMonth"), 0);
        double homePrice = parseDouble(q.get("homePrice"), 0);
        double downPaymentPercent = parseDouble(q.get("downPaymentPercent"), 20);
        double mortgageRate = parseDouble(q.get("mortgageRate"), 6.5);
        double propertyTaxRate = parseDouble(q.get("propertyTaxRate"), 1.2);
        double homeMaintenancePercent = parseDouble(q.get("homeMaintenancePercent"), 1.0);
        double homeAppreciationAnnual = parseDouble(q.get("homeAppreciationAnnual"), 3.0);
        
        // Car Event  
        int carBuyMonth = parseInt(q.get("carBuyMonth"), 0);
        double carPrice = parseDouble(q.get("carPrice"), 0);
        double carDownPaymentPercent = parseDouble(q.get("carDownPaymentPercent"), 10);
        double carLoanRate = parseDouble(q.get("carLoanRate"), 7.0);
        int carLoanYears = parseInt(q.get("carLoanYears"), 5);
        double carInsuranceMonthly = parseDouble(q.get("carInsuranceMonthly"), 150);
        double carGasMonthly = parseDouble(q.get("carGasMonthly"), 200);
        double carMaintenanceMonthly = parseDouble(q.get("carMaintenanceMonthly"), 100);
        
        // Education Event
        int collegeStartMonth = parseInt(q.get("collegeStartMonth"), 0);
        double collegeCost = parseDouble(q.get("collegeCost"), 0);
        double studentLoanAmount = parseDouble(q.get("studentLoanAmount"), 0);
        double studentLoanRate = parseDouble(q.get("studentLoanRate"), 5.0);
        int studentLoanYears = parseInt(q.get("studentLoanYears"), 10);

        // ---- simulation state ----
        double cash = startingCash;
        double portfolio = 0.0;
        double rMonthly = (returnAnnual / 100.0) / 12.0;
        double monthlyIncome = (salaryAnnual * 0.76) / 12.0; // Assume 24% effective tax rate

        double loanBal = loanBalance;
        double loanRMonthly = (loanRateAnnual / 100.0) / 12.0;
        
        // New state variables for life events
        double homeEquity = 0.0;
        double homeValue = 0.0;
        double mortgageBalance = 0.0;
        double monthlyHousingCost = 0.0;
        boolean hasHouse = false;
        
        double carValue = 0.0;
        double carLoanBalance = 0.0;
        double monthlyCarCost = 0.0;
        boolean hasCar = false;
        
        double studentLoanBalance = 0.0;
        double monthlyStudentLoanPayment = 0.0;
        boolean hasStudentLoan = false;
        
        // Track life events and recommendations
        List<String> lifeEvents = new ArrayList<>();
        List<String> monthlyNarratives = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();

        int mid = Math.max(1, months / 2);
        double cashMid = 0, portMid = 0, loanMid = 0, netMid = 0, homeMid = 0, carMid = 0;

        List<Monthly> series = new ArrayList<>(months);

        // ---- Generate Smart Recommendations ----
        generateRecommendations(recommendations, salaryAnnual, homePrice, carPrice, studentLoanAmount);

        // ---- monthly loop with life events ----
        for (int m = 1; m <= months; m++) {
            String monthNarrative = "";
            
            // ---- LIFE EVENT CHAIN REACTIONS ----
            
            // Month X: Buy house
            if (m == houseBuyMonth && houseBuyMonth > 0 && !hasHouse) {
                double downPayment = homePrice * (downPaymentPercent / 100.0);
                cash -= downPayment;
                homeValue = homePrice;
                homeEquity = downPayment;
                mortgageBalance = homePrice - downPayment;
                monthlyHousingCost = calculateMonthlyHousingCost(homePrice, downPaymentPercent, 
                                                               mortgageRate, propertyTaxRate, homeMaintenancePercent);
                hasHouse = true;
                lifeEvents.add("Month " + m + ": Bought house for $" + round2num(homePrice) + 
                              " with $" + round2num(downPayment) + " down payment");
                monthNarrative += "Bought house! Cash: -$" + round2num(downPayment) + 
                                 ", Monthly housing cost: $" + round2num(monthlyHousingCost);
            }
            
            // House appreciation and mortgage payment
            if (hasHouse) {
                if (m > houseBuyMonth) {
                    double monthlyAppreciation = homeAppreciationAnnual / 100.0 / 12.0;
                    homeValue *= (1 + monthlyAppreciation);
                }
                
                if (mortgageBalance > 0) {
                    double interest = mortgageBalance * (mortgageRate / 100.0 / 12.0);
                    double principal = monthlyHousingCost - interest;
                    mortgageBalance = Math.max(0, mortgageBalance - principal);
                    homeEquity = homeValue - mortgageBalance;
                    cash -= monthlyHousingCost;
                }
            }
            
            // Month X: Buy car
            if (m == carBuyMonth && carBuyMonth > 0 && !hasCar) {
                double carDownPayment = carPrice * (carDownPaymentPercent / 100.0);
                cash -= carDownPayment;
                carValue = carPrice;
                carLoanBalance = carPrice - carDownPayment;
                monthlyCarCost = calculateMonthlyCarCost(carPrice, carDownPaymentPercent, 
                                                       carLoanRate, carLoanYears, carInsuranceMonthly, 
                                                       carGasMonthly, carMaintenanceMonthly);
                hasCar = true;
                lifeEvents.add("Month " + m + ": Bought car for $" + round2num(carPrice) + 
                              " with $" + round2num(carDownPayment) + " down payment");
                monthNarrative += "Bought car! Cash: -$" + round2num(carDownPayment) + 
                                 ", Monthly car cost: $" + round2num(monthlyCarCost);
            }
            
            // Car loan payment and depreciation
            if (hasCar) {
                if (carLoanBalance > 0) {
                    double carInterest = carLoanBalance * (carLoanRate / 100.0 / 12.0);
                    double carPrincipal = monthlyCarCost - carInterest - carInsuranceMonthly - carGasMonthly - carMaintenanceMonthly;
                    carLoanBalance = Math.max(0, carLoanBalance - carPrincipal);
                    cash -= (carPrincipal + carInterest + carInsuranceMonthly + carGasMonthly + carMaintenanceMonthly);
                }
                
                // Car depreciation (loses 15% first year, then 10% annually)
                if (m > carBuyMonth) {
                    if (m <= carBuyMonth + 12) {
                        carValue *= 0.985; // 15% first year = ~1.25% per month
                    } else {
                        carValue *= 0.992; // 10% annually = ~0.83% per month
                    }
                }
            }
            
            // Month X: Start college/student loans
            if (m == collegeStartMonth && collegeStartMonth > 0 && !hasStudentLoan) {
                studentLoanBalance = studentLoanAmount;
                monthlyStudentLoanPayment = calculateMonthlyStudentLoanPayment(studentLoanAmount, studentLoanRate, studentLoanYears);
                hasStudentLoan = true;
                lifeEvents.add("Month " + m + ": Started college with $" + round2num(studentLoanAmount) + 
                              " in student loans at " + studentLoanRate + "% for " + studentLoanYears + " years");
                monthNarrative += "Started college! Student loan payment: $" + round2num(monthlyStudentLoanPayment);
            }
            
            // Student loan payment
            if (hasStudentLoan && studentLoanBalance > 0) {
                double studentInterest = studentLoanBalance * (studentLoanRate / 100.0 / 12.0);
                double studentPrincipal = monthlyStudentLoanPayment - studentInterest;
                studentLoanBalance = Math.max(0, studentLoanBalance - studentPrincipal);
                cash -= monthlyStudentLoanPayment;
            }
            
            // ---- REGULAR MONTHLY LOGIC (enhanced) ----
            
            // Income
            cash += monthlyIncome;
            
            // Base monthly expenses
            cash -= monthlyExpenses;
            
            // invest (if we have cash after all commitments)
            if (cash >= monthlyInvest) {
                portfolio = portfolio * (1 + rMonthly) + monthlyInvest;
                cash -= monthlyInvest;
            } else if (cash < monthlyInvest) {
                monthNarrative += " (Can't invest - low cash after commitments)";
            }

            // Existing student loan (if any)
            if (loanBal > 0 && (loanMinPayment > 0 || loanExtraPayment > 0)) {
                double interest = loanBal * loanRMonthly;
                double scheduled = loanMinPayment + loanExtraPayment;
                double payment = Math.min(loanBal + interest, scheduled);
                double principal = Math.max(0, payment - interest);
                loanBal = Math.max(0, loanBal - principal);
                cash -= payment;
            }

            double netWorth = cash + portfolio + homeEquity + carValue - loanBal - carLoanBalance - studentLoanBalance;

            if (m == mid) {
                cashMid = cash; 
                portMid = portfolio; 
                loanMid = loanBal; 
                netMid = netWorth;
                homeMid = homeEquity;
                carMid = carValue;
            }

            series.add(new Monthly(m, round2num(cash), round2num(portfolio), round2num(loanBal), round2num(netWorth)));
            monthlyNarratives.add(monthNarrative.isEmpty() ? "Normal month" : monthNarrative);
        }

        double finalCash = series.get(series.size()-1).cash;
        double finalPort = series.get(series.size()-1).portfolio;
        double finalDebt = series.get(series.size()-1).debt;
        double finalNet = series.get(series.size()-1).netWorth;
        double finalHomeEquity = homeEquity;
        double finalCarValue = carValue;

        // ---- build JSON (enhanced with life events and recommendations) ----
        StringBuilder monthlyJson = new StringBuilder("\"monthly\":[");
        for (int i = 0; i < series.size(); i++) {
            Monthly p = series.get(i);
            if (i > 0) monthlyJson.append(",");
            monthlyJson.append("{")
                .append("\"month\":").append(p.month).append(",")
                .append("\"cash\":").append(p.cash).append(",")
                .append("\"portfolio\":").append(p.portfolio).append(",")
                .append("\"debt\":").append(p.debt).append(",")
                .append("\"netWorth\":").append(p.netWorth).append(",")
                .append("\"narrative\":\"").append(monthlyNarratives.get(i)).append("\"")
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
                .append("\"loanExtraPayment\":").append(round2num(loanExtraPayment)).append(",")
                .append("\"salaryAnnual\":").append(round2num(salaryAnnual)).append(",")
                .append("\"monthlyExpenses\":").append(round2num(monthlyExpenses))
            .append("},")
            .append("\"lifeEvents\":[");
        
        // Add life events to JSON
        for (int i = 0; i < lifeEvents.size(); i++) {
            if (i > 0) json.append(",");
            json.append("\"").append(lifeEvents.get(i)).append("\"");
        }
        json.append("],")
            .append("\"recommendations\":[");
        
        // Add recommendations to JSON
        for (int i = 0; i < recommendations.size(); i++) {
            if (i > 0) json.append(",");
            json.append("\"").append(recommendations.get(i)).append("\"");
        }
        json.append("],")
            .append("\"checkpoints\":{")
                .append("\"mid\":{")
                    .append("\"month\":").append(mid).append(",")
                    .append("\"cash\":").append(round2num(cashMid)).append(",")
                    .append("\"portfolio\":").append(round2num(portMid)).append(",")
                    .append("\"debt\":").append(round2num(loanMid)).append(",")
                    .append("\"netWorth\":").append(round2num(netMid)).append(",")
                    .append("\"homeEquity\":").append(round2num(homeMid)).append(",")
                    .append("\"carValue\":").append(round2num(carMid))
                .append("},")
                .append("\"final\":{")
                    .append("\"month\":").append(months).append(",")
                    .append("\"cash\":").append(finalCash).append(",")
                    .append("\"portfolio\":").append(finalPort).append(",")
                    .append("\"debt\":").append(finalDebt).append(",")
                    .append("\"netWorth\":").append(finalNet).append(",")
                    .append("\"homeEquity\":").append(round2num(finalHomeEquity)).append(",")
                    .append("\"carValue\":").append(round2num(finalCarValue))
                .append("}")
            .append("},")
            .append(monthlyJson).append(",")
            .append("\"summary\":\"After ").append(months).append(" months with ").append(lifeEvents.size())
            .append(" life events, net worth is $").append(round2(finalNet))
            .append(" (Cash: $").append(round2(finalCash))
            .append(", Portfolio: $").append(round2(finalPort))
            .append(", Home: $").append(round2(finalHomeEquity))
            .append(", Car: $").append(round2(finalCarValue))
            .append(", Total Debt: $").append(round2(finalDebt + carLoanBalance + studentLoanBalance)).append(").\"")
        .append("}");

        byte[] body = json.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json; charset=utf-8");
        exchange.sendResponseHeaders(200, body.length);
        try (OutputStream os = exchange.getResponseBody()) { os.write(body); }
    }

    // ---- NEW: Helper methods for life events ----
    private static void generateRecommendations(List<String> recommendations, double salaryAnnual, 
                                             double homePrice, double carPrice, double studentLoanAmount) {
        // House affordability: 3x annual salary rule
        double maxAffordableHouse = salaryAnnual * 3.0;
        if (homePrice > 0) {
            if (homePrice > maxAffordableHouse) {
                recommendations.add("⚠️ House price $" + round2num(homePrice) + " exceeds recommended $" + 
                                 round2num(maxAffordableHouse) + " (3x your salary)");
            } else {
                recommendations.add("✅ House price $" + round2num(homePrice) + " is within affordable range");
            }
        } else {
            recommendations.add(" Based on your $" + salaryAnnual + " salary, you can afford up to $" + 
                             round2num(maxAffordableHouse) + " house");
        }
        
        // Car affordability: 50% of annual salary rule  
        double maxAffordableCar = salaryAnnual * 0.5;
        if (carPrice > 0) {
            if (carPrice > maxAffordableCar) {
                recommendations.add("⚠️ Car price $" + round2num(carPrice) + " exceeds recommended $" + 
                                 round2num(maxAffordableCar) + " (50% of your salary)");
            } else {
                recommendations.add("✅ Car price $" + round2num(carPrice) + " is within affordable range");
            }
        } else {
            recommendations.add("🚗 Consider cars under $" + round2num(maxAffordableCar) + 
                             " to keep payments manageable");
        }
        
        // Education affordability: Monthly payment should be <15% of take-home pay
        double monthlyTakeHome = salaryAnnual * 0.76 / 12; // Assume 24% tax
        double maxMonthlyEducationPayment = monthlyTakeHome * 0.15;
        if (studentLoanAmount > 0) {
            double estimatedMonthlyPayment = studentLoanAmount * 0.01; // Rough estimate
            if (estimatedMonthlyPayment > maxMonthlyEducationPayment) {
                recommendations.add("⚠️ Student loan payment ~$" + round2num(estimatedMonthlyPayment) + 
                                 " may exceed recommended $" + round2num(maxMonthlyEducationPayment));
            } else {
                recommendations.add("✅ Student loan payment appears manageable");
            }
        } else {
            recommendations.add("🎓 Keep monthly education payments under $" + 
                             round2num(maxMonthlyEducationPayment) + " for financial stability");
        }
    }

    private static double calculateMonthlyHousingCost(double homePrice, double downPaymentPercent, 
                                                    double mortgageRate, double propertyTaxRate, double maintenancePercent) {
        double loanAmount = homePrice * (1 - downPaymentPercent / 100.0);
        double monthlyRate = (mortgageRate / 100.0) / 12.0;
        int totalPayments = 30 * 12; // 30-year fixed
        
        if (monthlyRate == 0) {
            return loanAmount / totalPayments;
        }
        
        double mortgagePayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) 
                                / (Math.pow(1 + monthlyRate, totalPayments) - 1);
        
        double propertyTax = (homePrice * (propertyTaxRate / 100.0)) / 12.0;
        double maintenance = (homePrice * (maintenancePercent / 100.0)) / 12.0;
        
        return Math.round((mortgagePayment + propertyTax + maintenance) * 100.0) / 100.0;
    }

    private static double calculateMonthlyCarCost(double carPrice, double downPaymentPercent, 
                                                double loanRate, int loanYears, double insurance, 
                                                double gas, double maintenance) {
        double loanAmount = carPrice * (1 - downPaymentPercent / 100.0);
        double monthlyRate = (loanRate / 100.0) / 12.0;
        int totalPayments = loanYears * 12;
        
        if (monthlyRate == 0) {
            return loanAmount / totalPayments;
        }
        
        double carPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) 
                           / (Math.pow(1 + monthlyRate, totalPayments) - 1);
        
        return Math.round((carPayment + insurance + gas + maintenance) * 100.0) / 100.0;
    }

    private static double calculateMonthlyStudentLoanPayment(double loanAmount, double rate, int years) {
        double monthlyRate = (rate / 100.0) / 12.0;
        int totalPayments = years * 12;
        
        if (monthlyRate == 0) {
            return loanAmount / totalPayments;
        }
        
        double payment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) 
                        / (Math.pow(1 + monthlyRate, totalPayments) - 1);
        
        return Math.round(payment * 100.0) / 100.0;
    }

    // ---- existing helpers ----
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
