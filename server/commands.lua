lib.addCommand('sk_addcheckpoint', {
    help = 'Ajouter un checkpoint à un circuit',
    params = {{
        name = 'id',
        type = 'number',
        help = 'ID du circuit'
    }},
    restricted = false
}, function(source, args, rawCommand)
    local trackId = args.id
    if not trackId then
        lib.notify({
            title = 'RACE',
            description = 'Usage: /sk_addcheckpoint <id>',
            type = 'error'
        })
        return
    end

    local playerPed = PlayerPedId()
    local position = GetEntityCoords(playerPed)

    local src = source
    print(("Joueur %d veut ajouter un checkpoint à la piste %d sur : x=%.2f y=%.2f z=%.2f"):format(src, trackId,
        position.x, position.y, position.z))
    local track = MySQL.single.await('SELECT * FROM skulrag_races_tracks WHERE id = ?', {trackId})

    local checkpoints = json.decode(track.checkpoints) or {}
    local prevCheckpoint = checkpoints[#checkpoints]
    local distanceToAdd = 0.0
    if prevCheckpoint ~= nil then
        local prevVec = checkpointToVector(prevCheckpoint)
        distanceToAdd = #(vector3(x, y, z) - prevVec)
    end

    table.insert(checkpoints, {
        x = position.x,
        y = position.y,
        z = position.z
    })

    local newTotalDistance = (tonumber(track.distance) or 0) + distanceToAdd

    MySQL.update.await('UPDATE skulrag_races_tracks SET checkpoints = ?, distance = ? WHERE id = ?',
        {json.encode(checkpoints), newTotalDistance, trackId})
    print(("Checkpoint sauvegardé ! Nouvelle distance totale : %.2f m (+%.2f m ajoutés)"):format(newTotalDistance,
        distanceToAdd))
    lib.notify({
        title = 'RACE',
        description = ('Checkpoint ajouté au circuit #%s !'):format(trackId),
        type = 'success'
    })
end)

lib.addCommand('sk_startRace', {
    help = 'Démarre une course dont tu es le propriétaire',
    params = {{
        name = 'raceId',
        type = 'number',
        help = 'ID de la course'
    }},
    restricted = false
}, function(src, args, raw)
    local player = exports.qbx_core:GetPlayer(src)
    if not player then
        lib.notify({
            title = 'System',
            description = "Tu n'es pas connecté.",
            type = 'error',
            position = 'top'
        }, src)
        return
    end

    local raceId = args.raceId
    if not raceId then
        lib.notify({
            title = 'System',
            description = 'Usage: /sk_startRace <raceId>',
            type = 'error',
            position = 'top'
        }, src)
        return
    end

    -- Chercher la course
    local race = MySQL.single.await('SELECT * FROM skulrag_races_races WHERE id = ?', {raceId})
    if not race then
        lib.notify({
            title = 'System',
            description = 'Course non trouvée.',
            type = 'error',
            position = 'top'
        }, src)
        return
    end

    -- Vérifier que c'est le créateur
    if race.identifier ~= player.PlayerData.citizenid then
        lib.notify({
            title = 'System',
            description = "Tu n'es pas le propriétaire de cette course !",
            type = 'error',
            position = 'top'
        }, src)
        return
    end

    -- Vérifie que la date de la course est aujourd'hui
    -- race.date est un timestamp (en millisecondes !)
    local raceDateUnix = math.floor(tonumber(race.date) / 1000) -- En secondes arrondi
    local raceDay = os.date("%Y-%m-%d", raceDateUnix) -- "YYYY-MM-DD"
    local now = os.date("%Y-%m-%d") -- Aujourd'hui, "YYYY-MM-DD"

    if raceDay ~= now then
        lib.notify({
            title = 'System',
            description = ("Tu ne peux démarrer cette course que le jour prévu (%s)."):format(raceDay),
            type = 'error',
            position = 'top'
        }, src)
        return
    end

    -- Load les checkpoints du circuit
    local track = MySQL.single.await('SELECT * FROM skulrag_races_tracks WHERE id = ?', {race.trackId})
    if not track or not track.checkpoints then
        lib.notify({
            title = 'System',
            description = "Impossible de charger les checkpoints de ce circuit.",
            type = 'error'
        }, src)
        return
    end

    -- Décode la colonne checkpoints (json)
    local checkpoints = json.decode(track.checkpoints)
    if not checkpoints or type(checkpoints) ~= "table" or #checkpoints == 0 then
        lib.notify({
            title = 'System',
            description = "Circuit invalide (aucun checkpoint).",
            type = 'error'
        }, src)
        return
    end

    -- Insère checkpoints dans race
    race.checkpoints = checkpoints
    race.trackType = track.type

    -- Décode joueurs inscrits
    local registeredPlayers = {}
    if race.registeredPlayers and race.registeredPlayers ~= "" then
        local decoded = json.decode(race.registeredPlayers)
        if type(decoded) == "table" then
            registeredPlayers = decoded
        end
    end

    -- Pour chaque joueur inscrit, démarrer la course client-side
    for _, cid in ipairs(registeredPlayers) do
        local target = exports.qbx_core:GetPlayerByCitizenId(cid)
        if target then
            TriggerClientEvent("__sk_races:startRace", target.PlayerData.source, race)
        end
    end

    -- MAJ historique après démarrage
    local ok, err = pcall(function()
        MySQL.update.await('UPDATE skulrag_races_history SET isStarted = 1 WHERE raceId = ?',
            {raceId})
    end)
    if not ok then
        print("[HISTORY] Erreur MAJ course dans history :", err)
    end

    lib.notify({
        title = 'System',
        description = "Course démarrée pour tous les participants !",
        type = 'success',
        position = 'top'
    }, src)
end)

