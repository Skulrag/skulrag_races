RegisterNetEvent("__sk_races:postPlayerFinishedRace")
AddEventHandler("__sk_races:postPlayerFinishedRace", function(raceId, elapsed)
    local src = source
    local Player = exports.qbx_core:GetPlayer(src)
    if not Player then
        print("Joueur non trouvé")
        return
    end
    local citizenid = Player.PlayerData.citizenid

    -- Ajout atomique du finisher et winner
    local affected = MySQL.update.await([[
        UPDATE skulrag_races_history
        SET
            finishers = JSON_ARRAY_APPEND(finishers, '$', JSON_OBJECT('identifier', ?, 'rank', JSON_LENGTH(finishers) + 1, 'elapsedTime', ?))
        WHERE raceId = ?
        AND JSON_SEARCH(finishers, 'one', ?) IS NULL
    ]], {citizenid, elapsed, raceId, citizenid})

    if affected and affected > 0 then
        print("Finisher ajouté atomiquement")
    else
        print("Le joueur figurait déjà dans les finishers (double arrivée ?)")
    end

    -- Vérification de la fin de course
    -- On récupère finishers + registeredPlayers d'un coup
    local res = MySQL.single.await([[
        SELECT 
            JSON_LENGTH(history.finishers) as nFinishers, 
            JSON_LENGTH(races.registeredPlayers) as nRegistered, 
            races.registeredPlayers
        FROM skulrag_races_history history
        JOIN skulrag_races_races races ON races.id = history.raceId
        WHERE history.raceId = ?
    ]], {raceId})

    if res and res.nFinishers and res.nRegistered and res.nFinishers == res.nRegistered then
        -- Flag de course terminée
        MySQL.update.await("UPDATE skulrag_races_history SET isFinished = 1 WHERE raceId = ?", {raceId})
        MySQL.update.await('DELETE FROM skulrag_races_races WHERE id = ?', {raceId})
        -- Notifier TOUS les inscrits (tous les joueurs de registeredPlayers)
        local registeredList = json.decode(res.registeredPlayers)
        if registeredList then
            for _, citizenId in ipairs(registeredList) do
                -- Retrouve le src du citizenid si tu stockes les joueurs connectés :
                local targetSrc = exports.qbx_core:GetPlayerByCitizenId(citizenId)
                if targetSrc then
                    TriggerClientEvent("__sk_races:raceFinished", targetSrc)
                end
            end
        end
    end
end)


