# skulrag_races (Scroll down for english README)

![GitHub release (latest by date)](https://img.shields.io/github/v/release/Skulrag/skulrag_races)
![FiveM](https://img.shields.io/badge/FiveM-Resource-orange)
![Build](https://img.shields.io/github/actions/workflow/status/Skulrag/skulrag_races/release.yml?branch=main)

## 🚀 Présentation

**skulrag_races** est un script *FiveM* destiné aux serveurs roleplay, **basé sur le framework QBox**.  
Il permet aux joueurs de créer leurs propres circuits et d'organiser tout type de course (*seule votre imagination sera votre limite*).

La fonction "switch" du type de course "Légale / Illégale" est pour le moment inutile, une prochaine version du script intégrera le fait de cacher les courses illégales aux joueurs ayant un job déifni dans une liste de configuration (exemple : police, fbi, ...).

---

## 📦 Dépendances obligatoires

Pour fonctionner, le script nécessite impérativement les ressources suivantes :

- [`qbx_core`](https://github.com/qbox-project/qbx-core)
- [`ox_lib`](https://github.com/overextended/ox_lib)
- [`oxmysql`](https://github.com/overextended/oxmysql)

Assurez-vous qu'elles sont installées et correctement configurées sur votre serveur.

---

## 🛠️ Installation

> **Pré-requis :**  
> - Serveur FiveM (FXServer)
> - **Framework QBox** opérationnel, avec les dépendances :  
>    - `qbx_core`, `ox_lib`, `oxmysql`
> - Base de données MySQL/MariaDB prête à l'emploi

### 1. Télécharger la dernière Release

- Allez sur [Releases](https://github.com/Skulrag/skulrag_races/releases)
- Téléchargez **skulrag_races_release.zip**

### 2. Déployer sur votre serveur

1. Décompressez l’archive dans votre dossier `resources`  
   *(Exemple : `resources/skulrag_races`)*
2. **Installez les tables SQL dans votre base de données** :  
   Exécutez toutes les requêtes du fichier `skulrag_races/skulrag_races.sql`
3. Ajoutez la ressource à votre `server.cfg` :
    ```
    ensure skulrag_races
    ```
4. Vérifiez que les dépendances (`qbx_core`, `ox_lib`, `oxmysql`) tournent correctement avant de lancer la ressource.
5. Redémarrez le serveur

# skulrag_races (ENGLISH)

## 🚀 Overview

**skulrag_races** is a *FiveM* script designed for roleplay servers, **based on the QBox framework**.  
It allows players to create their own circuits and organize any type of race (*only your imagination is the limit*).

The "switch" function for the "Legal / Illegal" race type is currently unused. In a future version of the script, illegal races will be hidden from players who have a job defined in a configuration list (for example: police, FBI, etc.).

---

## 📦 Required Dependencies

To function properly, the script requires the following resources:

- [`qbx_core`](https://github.com/qbox-project/qbx-core)
- [`ox_lib`](https://github.com/overextended/ox_lib)
- [`oxmysql`](https://github.com/overextended/oxmysql)

Make sure these are installed and properly configured on your server.

---

## 🛠️ Installation

> **Requirements:**  
> - FiveM server (FXServer)
> - **QBox framework** up and running, with dependencies:  
>    - `qbx_core`, `ox_lib`, `oxmysql`
> - MySQL/MariaDB database ready to use

### 1. Download the Latest Release

- Go to [Releases](https://github.com/Skulrag/skulrag_races/releases)
- Download **skulrag_races_release.zip**

### 2. Deploy on Your Server

1. Extract the archive into your `resources` folder  
   *(Example: `resources/skulrag_races`)*
2. **Install the SQL tables in your database**:  
   Run all queries from the file `skulrag_races/skulrag_races.sql`
3. Add the resource to your `server.cfg`:
    ```
    ensure skulrag_races
    ```
4. Make sure the dependencies (`qbx_core`, `ox_lib`, `oxmysql`) are up and running before starting the resource.
5. Restart your server
