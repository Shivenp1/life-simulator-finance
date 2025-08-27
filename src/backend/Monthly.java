package src.backend;

public class Monthly {
    public final int month;
    public final double cash;
    public final double portfolio;
    public final double debt;
    public final double netWorth;

    public Monthly(int month, double cash, double portfolio, double debt, double netWorth) {
        this.month = month;
        this.cash = cash;
        this.portfolio = portfolio;
        this.debt = debt;
        this.netWorth = netWorth;
    }
}
