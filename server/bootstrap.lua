-- ============================================================
--  skulrag_races — Bootstrap SQL
--  Crée les tables manquantes et vérifie l'intégrité des
--  colonnes au démarrage de la ressource.
-- ============================================================

local RESOURCE = GetCurrentResourceName()

-- ── Définition des tables ───────────────────────────────────

local TABLES = {
    -- ── skulrag_races_users ──────────────────────────────────
    {
        name = 'skulrag_races_users',
        create = [[
            CREATE TABLE IF NOT EXISTS `skulrag_races_users` (
                `identifier` VARCHAR(50)  NOT NULL,
                `pseudo`     VARCHAR(50)  NOT NULL,
                PRIMARY KEY (`identifier`),
                UNIQUE INDEX `pseudo` (`pseudo`)
            ) COLLATE='utf8mb3_general_ci' ENGINE=InnoDB;
        ]],
        columns = {
            { name = 'identifier', definition = 'VARCHAR(50) NOT NULL' },
            { name = 'pseudo',     definition = 'VARCHAR(50) NOT NULL' },
        },
    },

    -- ── skulrag_races_tracks ─────────────────────────────────
    {
        name = 'skulrag_races_tracks',
        create = [[
            CREATE TABLE IF NOT EXISTS `skulrag_races_tracks` (
                `id`          INT(11)      NOT NULL AUTO_INCREMENT,
                `identifier`  VARCHAR(50)  NOT NULL,
                `name`        VARCHAR(50)  NOT NULL,
                `type`        VARCHAR(50)  NOT NULL,
                `checkpoints` TEXT         NULL DEFAULT NULL,
                `planned`     INT(11)      NOT NULL DEFAULT 0,
                `distance`    FLOAT        NOT NULL DEFAULT 0,
                PRIMARY KEY (`id`),
                UNIQUE INDEX `name` (`name`)
            ) COLLATE='utf8mb3_general_ci' ENGINE=InnoDB;
        ]],
        columns = {
            { name = 'id',          definition = 'INT(11) NOT NULL AUTO_INCREMENT' },
            { name = 'identifier',  definition = 'VARCHAR(50) NOT NULL' },
            { name = 'name',        definition = 'VARCHAR(50) NOT NULL' },
            { name = 'type',        definition = 'VARCHAR(50) NOT NULL' },
            { name = 'checkpoints', definition = 'TEXT NULL DEFAULT NULL' },
            { name = 'planned',     definition = 'INT(11) NOT NULL DEFAULT 0' },
            { name = 'distance',    definition = 'FLOAT NOT NULL DEFAULT 0' },
        },
    },

    -- ── skulrag_races_races ──────────────────────────────────
    {
        name = 'skulrag_races_races',
        create = [[
            CREATE TABLE IF NOT EXISTS `skulrag_races_races` (
                `id`         INT(11)       NOT NULL AUTO_INCREMENT,
                `trackId`    INT(11)       NOT NULL,
                `identifier` VARCHAR(50)   NOT NULL,
                `date`       DATETIME      NOT NULL,
                `laps`       INT(11)       NULL DEFAULT NULL,
                `type`       VARCHAR(50)   NOT NULL,
                `cashprize`  VARCHAR(50)   NOT NULL,
                `entries`    VARCHAR(255)  NULL DEFAULT NULL,
                PRIMARY KEY (`id`),
                UNIQUE INDEX `trackId` (`trackId`)
            ) COLLATE='utf8mb3_general_ci' ENGINE=InnoDB;
        ]],
        columns = {
            { name = 'id',         definition = 'INT(11) NOT NULL AUTO_INCREMENT' },
            { name = 'trackId',    definition = 'INT(11) NOT NULL' },
            { name = 'identifier', definition = 'VARCHAR(50) NOT NULL' },
            { name = 'date',       definition = 'DATETIME NOT NULL' },
            { name = 'laps',       definition = 'INT(11) NULL DEFAULT NULL' },
            { name = 'type',       definition = 'VARCHAR(50) NOT NULL' },
            { name = 'cashprize',  definition = 'VARCHAR(50) NOT NULL' },
            -- 'entries' était absent du fichier .sql original — ajouté ici
            { name = 'entries',    definition = 'VARCHAR(255) NULL DEFAULT NULL' },
        },
    },

    -- ── skulrag_races_history ────────────────────────────────
    -- Table absente du fichier .sql original mais utilisée partout
    {
        name = 'skulrag_races_history',
        create = [[
            CREATE TABLE IF NOT EXISTS `skulrag_races_history` (
                `id`         INT(11)       NOT NULL AUTO_INCREMENT,
                `raceId`     INT(11)       NOT NULL,
                `trackId`    INT(11)       NULL DEFAULT NULL,
                `trackName`  VARCHAR(100)  NULL DEFAULT NULL,
                `cashprize`  VARCHAR(50)   NOT NULL,
                `finishers`  TEXT          NULL DEFAULT NULL,
                `date`       DATETIME      NOT NULL,
                `isFinished` TINYINT(1)    NOT NULL DEFAULT 0,
                `isCanceled` TINYINT(1)    NOT NULL DEFAULT 0,
                `isStarted`  TINYINT(1)    NOT NULL DEFAULT 0,
                `initiator`  VARCHAR(50)   NOT NULL,
                PRIMARY KEY (`id`),
                INDEX `raceId` (`raceId`)
            ) COLLATE='utf8mb3_general_ci' ENGINE=InnoDB;
        ]],
        columns = {
            { name = 'id',         definition = 'INT(11) NOT NULL AUTO_INCREMENT' },
            { name = 'raceId',     definition = 'INT(11) NOT NULL' },
            { name = 'trackId',    definition = 'INT(11) NULL DEFAULT NULL' },
            { name = 'trackName',  definition = 'VARCHAR(100) NULL DEFAULT NULL' },
            { name = 'cashprize',  definition = 'VARCHAR(50) NOT NULL' },
            { name = 'finishers',  definition = 'TEXT NULL DEFAULT NULL' },
            { name = 'date',       definition = 'DATETIME NOT NULL' },
            { name = 'isFinished', definition = 'TINYINT(1) NOT NULL DEFAULT 0' },
            { name = 'isCanceled', definition = 'TINYINT(1) NOT NULL DEFAULT 0' },
            { name = 'isStarted',  definition = 'TINYINT(1) NOT NULL DEFAULT 0' },
            { name = 'initiator',  definition = 'VARCHAR(50) NOT NULL' },
        },
    },
}

-- ── Helpers ─────────────────────────────────────────────────

local function log(msg)
    print(('[^5%s^7] %s'):format(RESOURCE, msg))
end

local function warn(msg)
    print(('[^3%s^7] ^3%s^7'):format(RESOURCE, msg))
end

local function err(msg)
    print(('[^1%s^7] ^1%s^7'):format(RESOURCE, msg))
end

-- ── Récupère le nom de la base de données active ─────────────

local function getDatabase()
    local row = MySQL.single.await('SELECT DATABASE() AS db')
    return row and row.db
end

-- ── Vérifie et complète les colonnes d'une table ─────────────

local function checkColumns(dbName, tableDef)
    local existing = MySQL.query.await([[
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
    ]], { dbName, tableDef.name })

    local existingSet = {}
    for _, row in ipairs(existing) do
        existingSet[row.COLUMN_NAME] = true
    end

    local missing = {}
    for _, col in ipairs(tableDef.columns) do
        if not existingSet[col.name] then
            missing[#missing + 1] = col
        end
    end

    if #missing == 0 then
        log(('  ✓ %s — colonnes OK'):format(tableDef.name))
        return
    end

    for _, col in ipairs(missing) do
        warn(('  ⚠ %s — colonne manquante "%s", ajout en cours…'):format(tableDef.name, col.name))
        local ok, e = pcall(function()
            MySQL.query.await(('ALTER TABLE `%s` ADD COLUMN `%s` %s'):format(
                tableDef.name, col.name, col.definition
            ))
        end)
        if ok then
            log(('  ✓ %s — colonne "%s" ajoutée'):format(tableDef.name, col.name))
        else
            err(('  ✗ %s — impossible d\'ajouter "%s" : %s'):format(tableDef.name, col.name, tostring(e)))
        end
    end
end

-- ── Point d'entrée ───────────────────────────────────────────

CreateThread(function()
    -- Petit délai pour laisser oxmysql se connecter
    Wait(500)

    log('^5=== Vérification SQL au démarrage ===^7')

    local dbName = getDatabase()
    if not dbName then
        err('Impossible de déterminer la base de données active.')
        return
    end

    for _, tableDef in ipairs(TABLES) do
        -- 1) Créer la table si elle n'existe pas
        local ok, e = pcall(function()
            MySQL.query.await(tableDef.create)
        end)

        if not ok then
            err(('Erreur CREATE TABLE %s : %s'):format(tableDef.name, tostring(e)))
        else
            -- 2) Vérifier l'intégrité des colonnes
            checkColumns(dbName, tableDef)
        end
    end

    log('^2=== Vérification SQL terminée ===^7')
end)
