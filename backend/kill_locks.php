<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=ecommerce_matkinh', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt = $pdo->query("SHOW PROCESSLIST");
    $processes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($processes as $p) {
        if ($p['Id'] != $pdo->query("SELECT CONNECTION_ID()")->fetchColumn() && $p['Time'] > 10) {
            $pdo->exec("KILL " . $p['Id']);
            echo "Killed process " . $p['Id'] . " (Command: " . $p['Command'] . ", Time: " . $p['Time'] . ")\n";
        }
    }
    echo "Done resolving locks.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
