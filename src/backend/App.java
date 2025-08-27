package src.backend;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;

public class App {
    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        server.createContext("/", new HomeEndpoint());
        server.createContext("/simulate", new SimulationEndpoint());
        server.setExecutor(null);
        System.out.println("Server running at http://localhost:8080");
        server.start();
    }
}
