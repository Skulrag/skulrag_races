CREATE TABLE `skulrag_races_users` (
	`identifier` VARCHAR(50) NOT NULL,
	`pseudo` VARCHAR(50) NOT NULL,
	UNIQUE INDEX `pseudo` (`pseudo`),
	PRIMARY KEY (`identifier`)
)
COLLATE='utf8mb3_general_ci'
;

CREATE TABLE `skulrag_races_tracks` (
	`identifier` VARCHAR(50) NOT NULL COLLATE 'utf8mb3_general_ci',
	`name` VARCHAR(50) NOT NULL COLLATE 'utf8mb3_general_ci',
	`type` VARCHAR(50) NOT NULL COLLATE 'utf8mb3_general_ci',
	`checkpoints` TEXT NULL DEFAULT NULL COLLATE 'utf8mb3_general_ci',
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`planned` INT(11) NOT NULL DEFAULT '0',
	`distance` FLOAT NOT NULL DEFAULT '0',
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `name` (`name`) USING BTREE,
)
COLLATE='utf8mb3_general_ci'
ENGINE=InnoDB
;


CREATE TABLE `skulrag_races_races` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`trackId` INT(11) NOT NULL,
	`identifier` VARCHAR(50) NOT NULL COLLATE 'utf8mb3_general_ci',
	`date` DATETIME NOT NULL,
	`laps` INT(11) NULL DEFAULT NULL,
	`type` VARCHAR(50) NOT NULL COLLATE 'utf8mb3_general_ci',
	`cashprize` VARCHAR(50) NOT NULL COLLATE 'utf8mb3_general_ci',
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `trackId` (`trackId`) USING BTREE
)
COLLATE='utf8mb3_general_ci'
ENGINE=InnoDB
;


