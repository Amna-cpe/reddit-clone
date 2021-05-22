import {MigrationInterface, QueryRunner} from "typeorm";

export class createTheData1615462312656 implements MigrationInterface {
    name = 'createTheData1615462312656'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `subs` (`id` int NOT NULL AUTO_INCREMENT, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `name` varchar(255) NOT NULL, `title` varchar(255) NOT NULL, `description` text NULL, `imageUrn` varchar(255) NULL, `bannerUrn` varchar(255) NULL, `username` varchar(255) NULL, INDEX `IDX_2ae46b179b70ab8179597adb8c` (`name`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `posts` (`id` int NOT NULL AUTO_INCREMENT, `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), `identifier` varchar(255) NOT NULL, `title` varchar(255) NOT NULL, `slug` varchar(255) NOT NULL, `body` text NULL, `subName` varchar(255) NOT NULL, `username` varchar(255) NOT NULL, INDEX `IDX_152316363d20c399f934c4f74b` (`identifier`), INDEX `IDX_54ddf9075260407dcfdd724857` (`slug`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `subs` ADD CONSTRAINT `FK_4520ae7b26f68a13ec3e96dbbba` FOREIGN KEY (`username`) REFERENCES `users`(`username`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `votes` ADD CONSTRAINT `FK_79326ff26ef790424d820d54a72` FOREIGN KEY (`username`) REFERENCES `users`(`username`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `votes` ADD CONSTRAINT `FK_b5b05adc89dda0614276a13a599` FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `votes` ADD CONSTRAINT `FK_554879cbc33538bf15d6991f400` FOREIGN KEY (`commentId`) REFERENCES `comments`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `posts` ADD CONSTRAINT `FK_42377e3f89a203ca74d117e5961` FOREIGN KEY (`username`) REFERENCES `users`(`username`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `posts` ADD CONSTRAINT `FK_cca21672314ce54982a6dd5d121` FOREIGN KEY (`subName`) REFERENCES `subs`(`name`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `comments` ADD CONSTRAINT `FK_5d9144e84650ce78f40737e284e` FOREIGN KEY (`username`) REFERENCES `users`(`username`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `comments` ADD CONSTRAINT `FK_e44ddaaa6d058cb4092f83ad61f` FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `comments` DROP FOREIGN KEY `FK_e44ddaaa6d058cb4092f83ad61f`");
        await queryRunner.query("ALTER TABLE `comments` DROP FOREIGN KEY `FK_5d9144e84650ce78f40737e284e`");
        await queryRunner.query("ALTER TABLE `posts` DROP FOREIGN KEY `FK_cca21672314ce54982a6dd5d121`");
        await queryRunner.query("ALTER TABLE `posts` DROP FOREIGN KEY `FK_42377e3f89a203ca74d117e5961`");
        await queryRunner.query("ALTER TABLE `votes` DROP FOREIGN KEY `FK_554879cbc33538bf15d6991f400`");
        await queryRunner.query("ALTER TABLE `votes` DROP FOREIGN KEY `FK_b5b05adc89dda0614276a13a599`");
        await queryRunner.query("ALTER TABLE `votes` DROP FOREIGN KEY `FK_79326ff26ef790424d820d54a72`");
        await queryRunner.query("ALTER TABLE `subs` DROP FOREIGN KEY `FK_4520ae7b26f68a13ec3e96dbbba`");
        await queryRunner.query("DROP INDEX `IDX_54ddf9075260407dcfdd724857` ON `posts`");
        await queryRunner.query("DROP INDEX `IDX_152316363d20c399f934c4f74b` ON `posts`");
        await queryRunner.query("DROP TABLE `posts`");
        await queryRunner.query("DROP INDEX `IDX_2ae46b179b70ab8179597adb8c` ON `subs`");
        await queryRunner.query("DROP TABLE `subs`");
    }

}
