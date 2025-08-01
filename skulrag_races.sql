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
	`kms` INT(11) NOT NULL DEFAULT '0',
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `name` (`name`) USING BTREE,
	INDEX `id` (`id`) USING BTREE
)
COLLATE='utf8mb3_general_ci'
ENGINE=InnoDB
AUTO_INCREMENT=3
;

