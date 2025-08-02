RegisterCommand("sk_startRace", function(source, args, rawCommand)
    local src = source
    local player = exports.qbx_core:GetPlayer(src)
    if not player then
        TriggerClientEvent('chat:addMessage', src, {
            args = {"[System]", "Tu n'es pas connecté."}
        })
        return
    end

    local raceId = args[1]
    if not raceId then
        TriggerClientEvent('chat:addMessage', src, {
            args = {"[System]", "Usage: /sk_startRace <raceId>"}
        })
        return
    end

    -- Chercher la course
    local race = MySQL.single.await('SELECT * FROM skulrag_races_races WHERE id = ?', {raceId})
    if not race then
        TriggerClientEvent('chat:addMessage', src, {
            args = {"[System]", "Course non trouvée."}
        })
        return
    end

    -- Vérifier que c'est le créateur
    if race.identifier ~= player.PlayerData.citizenid then
        TriggerClientEvent('chat:addMessage', src, {
            args = {"[System]", "Tu n'es pas le propriétaire de cette course !"}
        })
        return
    end

    -- Vérifie que la date de la course est aujourd'hui
    local now = os.date("%Y-%m-%d")
    local raceDay = getDateStr(race.date) -- Convertit en "2024-06-09"
    print('raceDay', raceDay)
    if raceDay ~= now then
        TriggerClientEvent('chat:addMessage', src, {
            args = {"[System]", "Tu ne peux démarrer cette course que le jour prévu (" .. race.date .. ")."}
        })
        return
    end

    -- Après vérifs et AVANT d'envoyer la course
    -- Récupère les checkpoints du track associé
    local track = MySQL.single.await('SELECT * FROM skulrag_races_tracks WHERE id = ?', {race.trackId})
    if not track or not track.checkpoints then
        TriggerClientEvent('chat:addMessage', src, {
            args = {"[System]", "Impossible de charger les checkpoints de ce circuit."}
        })
        return
    end

    -- Décode la colonne checkpoints (doit être une chaîne JSON)
    local checkpoints = json.decode(track.checkpoints)
    if not checkpoints or type(checkpoints) ~= "table" or #checkpoints == 0 then
        TriggerClientEvent('chat:addMessage', src, {
            args = {"[System]", "Circuit invalide (aucun checkpoint)."}
        })
        return
    end

    -- Insère la table checkpoints dans ta variable `race`
    race.checkpoints = checkpoints
    race.trackType = track.type

    -- Extraire la liste des joueurs enregistrés
    local registeredPlayers = {}
    if race.registeredPlayers and race.registeredPlayers ~= "" then
        local decoded = json.decode(race.registeredPlayers)
        if type(decoded) == "table" then
            registeredPlayers = decoded
        end
    end

    -- Pour chaque joueur inscrit : démarrer la course côté client
    for _, cid in ipairs(registeredPlayers) do
        local target = exports.qbx_core:GetPlayerByCitizenId(cid)
        print('target', target.PlayerData.source)
        if target then
            TriggerClientEvent("__sk_races:startRace", target.PlayerData.source, race)
        end
    end

    TriggerClientEvent('chat:addMessage', src, {
        args = {"[System]", "Course démarrée pour tous les participants !"}
    })
end)

RegisterCommand("sk_cancelRace", function(source, args, rawCommand)
    local src = source
    local player = exports.qbx_core:GetPlayer(src)
    if not player then
        TriggerClientEvent('chat:addMessage', src, {
            args = {"[System]", "Tu n'es pas connecté."}
        })
        return
    end

    local raceId = args[1]
    if not raceId then
        TriggerClientEvent('chat:addMessage', src, {
            args = {"[System]", "Usage: /sk_cancelRace <raceId>"}
        })
        return
    end

    -- Chercher la course (pour vérifier le propriétaire)
    local race = MySQL.single.await('SELECT * FROM skulrag_races_races WHERE id = ?', {raceId})
    if not race then
        TriggerClientEvent('chat:addMessage', src, {
            args = {"[System]", "Course non trouvée."}
        })
        return
    end

    -- Vérifier que c'est le créateur
    if race.identifier ~= player.PlayerData.citizenid then
        TriggerClientEvent('chat:addMessage', src, {
            args = {"[System]", "Tu n'es pas le propriétaire de cette course !"}
        })
        return
    end

    -- Supprimer la course
    local affectedRows = MySQL.update.await('DELETE FROM skulrag_races_races WHERE id = ?', {raceId})
    if affectedRows > 0 then
        TriggerClientEvent('chat:addMessage', src, {
            args = {"[System]", "Course supprimée avec succès."}
        })

        -- Extraire la liste des joueurs enregistrés
        local registeredPlayers = {}
        if race.registeredPlayers and race.registeredPlayers ~= "" then
            local decoded = json.decode(race.registeredPlayers)
            if type(decoded) == "table" then
                registeredPlayers = decoded
            end
        end
        for _, cid in ipairs(registeredPlayers) do
            local target = exports.qbx_core:GetPlayerByCitizenId(cid)
            if target then
                -- Envoie juste la date ou la date+heure
                TriggerClientEvent("__sk_races:raceCanceled", target.PlayerData.source, ToFrDate(race.date))
            end
        end

    else
        TriggerClientEvent('chat:addMessage', src, {
            args = {"[System]", "Erreur : Impossible de supprimer la course."}
        })
    end
end)

