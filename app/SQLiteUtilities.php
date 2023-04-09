<?php
namespace App;

date_default_timezone_set('UTC');

class SQLiteUtilities {

    /**
     * PDO object
     * @var \PDO
     */
    private $pdo;

    /**
     * connect to the SQLite database
     */
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function executeCommands(...$commands) {
        foreach ($commands as $command) {
            $this->pdo->exec($command);
        }
    }

    public function getTableList() {
        $stmt = $this->pdo->query("SELECT name
                                   FROM sqlite_master
                                   WHERE type = 'table'
                                   ORDER BY name");
        $tables = [];
        while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
            $tables[] = $row['name'];
        }

        return $tables;
    }

    public function getFirstColumnValue($q, $column_name) {
        $stmt = $this->pdo->query($q);
        $value = $stmt->fetch(\PDO::FETCH_ASSOC)[$column_name];
        return $value;
    }

    public function getIterator($q) {
        $stmt = $this->pdo->query($q);
        return $stmt;
    }

}