lib.callback.register('__sk_races:registerPlayer', function(source, data)
    local _source = source
    local pin = data.pin
    if (Config.pin and pin and pin ~= Config.pin) then
        return {
            ['success'] = false,
            ['name'] = 'pin'
        }
    end
    local pseudo = data.pseudo
    if pseudo then
        local player = exports.qbx_core:GetPlayer(_source)
        local id = pcall(function()
            return MySQL.insert.await('INSERT INTO `skulrag_races_users` (identifier, pseudo) VALUES (?, ?)',
                {player.PlayerData.citizenid, pseudo})
        end)
        if not id then
            return {
                ['success'] = false,
                ['name'] = 'pseudo'
            };
        end
        return {
            ['success'] = true
        };
    end
end)

lib.callback.register('__sk_races:getPseudo', function(source, data)
    local _source = source
    local player = exports.qbx_core:GetPlayer(_source)
    local result, pseudo = pcall(function()
        return MySQL.scalar.await('SELECT pseudo FROM `skulrag_races_users` WHERE identifier = ?',
            {player.PlayerData.citizenid})
    end)
    return {
        ['pseudo'] = pseudo
    }
end)

lib.callback.register('__sk_races:postCreateTrack', function(source, data)
    local _source = source
    local name = data.name
    local type = data.type
    local player = exports.qbx_core:GetPlayer(_source)
    local id, message = pcall(function()
        return MySQL.insert.await('INSERT INTO `skulrag_races_tracks` (identifier, name, type) VALUES (?, ?, ?)',
            {player.PlayerData.citizenid, name, type})
    end)
    if not id then
        return {
            ['success'] = false
        };
    end
    return {
        ['success'] = true
    };
end)

lib.callback.register('__sk_races:getTracks', function(source)
    local _source = source
    local player = exports.qbx_core:GetPlayer(_source)
    local bool, result = pcall(function()
        return MySQL.query.await('SELECT * FROM `skulrag_races_tracks` WHERE identifier = ?',
            {player.PlayerData.citizenid})
    end)
    return result;
end)

lib.callback.register('__sk_races:deleteTrack', function(source, data)
    local id = data.track.id
    local result = pcall(function()
        return MySQL.query.await('DELETE FROM `skulrag_races_tracks` WHERE id = ?', {id})
    end)
    return result;
end)

lib.callback.register('__sk_races:postCreateRace', function(source, data)
    local _source = source
    local player = exports.qbx_core:GetPlayer(_source)
    if not player then
        return {
            ['success'] = false,
            ['error'] = 'Player not found'
        }
    end

    -- 1) Insérer dans la table principale
    local ok, raceInsertIdOrError = pcall(function()
        return MySQL.insert.await(
            'INSERT INTO `skulrag_races_races` (identifier, trackId, type, date, laps, cashprize, entries) VALUES (?, ?, ?, ?, ?, ?, ?)',
            {player.PlayerData.citizenid, data.trackId, data.type, isoToMySQLDate(data.date), data.laps, data.cashprize,
             data.entries})
    end)
    if not ok then
        print('[RACE] Erreur insertion races:', raceInsertIdOrError)
        return {
            ['success'] = false
        }
    end
    local _raceId = raceInsertIdOrError

    -- **2) Chercher le trackName depuis la DB** (par trackId)
    local trackName = nil
    local okTrack, trackResult = pcall(function()
        return MySQL.single.await('SELECT name FROM skulrag_races_tracks WHERE id = ?', {data.trackId})
    end)
    if okTrack and trackResult and trackResult.name then
        trackName = trackResult.name
    else
        trackName = nil -- En cas d'erreur ou absence, on laisse le champ à NULL
    end

    -- **3) Insérer dans history avec ce trackName**
    local okHist, histInsertIdOrError = pcall(function()
        return MySQL.insert.await([[
            INSERT INTO `skulrag_races_history`
                (cashprize, trackId, raceId, finishers, date, isFinished, isCanceled, isStarted, initiator, trackName)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ]], {data.cashprize, data.trackId, _raceId, json.encode({}), isoToMySQLDate(data.date), 0, 0, 0,
             player.PlayerData.citizenid, trackName})
    end)
    if not okHist then
        print('[RACE] Erreur insertion history:', histInsertIdOrError)
        return {
            ['success'] = false,
            ['warning'] = 'Race OK, history failed'
        }
    end

    return {
        ['success'] = true,
        ['raceId'] = _raceId,
        ['historyId'] = histInsertIdOrError
    }
end)

lib.callback.register('__sk_races:getRaces', function(source, data)
    local _source = source
    local player = exports.qbx_core:GetPlayer(_source)

    local filters = {}
    local params = {}

    if data.owned then
        table.insert(filters, '`r`.`identifier` = ?')
        table.insert(params, player.PlayerData.citizenid)
    end

    local baseFilter = [[
NOT EXISTS (
    SELECT 1 FROM skulrag_races_history h
    WHERE h.raceId = r.id
      AND (h.isFinished = 1 OR h.isCanceled = 1 OR h.isStarted = 1)
)
]]

    local allFilters = {baseFilter}
    for _, f in ipairs(filters) do
        table.insert(allFilters, f)
    end

    local whereClause = (#allFilters > 0) and ("WHERE " .. table.concat(allFilters, " AND ")) or ""

    local sql = ([[
    SELECT r.*, u.pseudo, t.name as trackName
    FROM skulrag_races_races r
    LEFT JOIN skulrag_races_users u ON r.identifier = u.identifier
    LEFT JOIN skulrag_races_tracks t ON r.trackId = t.id
    %s
    ]]):format(whereClause)

    local bool, result = pcall(function()
        return MySQL.query.await(sql, params)
    end)

    local now = os.date("*t") -- {year, month, day}
    for _, row in ipairs(result) do
        -- Check si le joueur courant est l'owner
        if player.PlayerData.citizenid == row.identifier then
            row.owner = true
        else
            row.owner = false
        end
        -- isOnline basé sur le jour
        local isOnline = false
        local y, m, d = getDatePartsFromTimestampMs(row.date)
        if y and m and d then
            if (y > now.year) or (y == now.year and m > now.month) or
                (y == now.year and m == now.month and d >= now.day) then
                isOnline = true
            end
        end
        row.isOnline = isOnline

        -- registeredPlayers
        local registeredPlayers = {}
        if row.registeredPlayers and row.registeredPlayers ~= "" then
            local decoded = json.decode(row.registeredPlayers)
            if type(decoded) == "table" then
                registeredPlayers = decoded
            end
        end

        -- isRegistered
        local isRegistered = false
        for _, v in ipairs(registeredPlayers) do
            if v == player.PlayerData.citizenid then
                isRegistered = true
                break
            end
        end
        row.isRegistered = isRegistered

        -- entriesLeft
        row.entriesLeft = row.entries - #registeredPlayers

        -------- Ajout récupération des participants pour les courses terminées -------
        -- Vérifie si la course est finie : adapte ce test selon ta logique
        if row.isFinished == true or row.isFinished == 1 then
            row.participants = {}
            if #registeredPlayers > 0 then
                local placeholders = {}
                for i = 1, #registeredPlayers do
                    table.insert(placeholders, "?")
                end
                local query = string.format([[
            SELECT pseudo FROM skulrag_races_users WHERE identifier IN (%s)
        ]], table.concat(placeholders, ","))

                local _, participantsResult = pcall(function()
                    return MySQL.query.await(query, registeredPlayers)
                end)
                if participantsResult then
                    local pseudos = {}
                    for _, participant in ipairs(participantsResult) do
                        table.insert(pseudos, participant.pseudo)
                    end
                    row.participants = pseudos
                end
            end
        end

        -- Remplacement du firstFinisher IDENTIFIER par le PSEUDO
        if row.firstFinisher then
            local query = "SELECT pseudo FROM skulrag_races_users WHERE identifier = ? LIMIT 1"
            local _, res = pcall(function()
                return MySQL.query.await(query, {row.firstFinisher})
            end)
            if res and res[1] and res[1].pseudo then
                row.firstFinisher = res[1].pseudo
            else
                row.firstFinisher = nil -- ou '' si tu préfères
            end
        end
    end

    return result
end)

lib.callback.register('__sk_races:postRegisterToRace', function(source, data)
    local _source = source
    local player = exports.qbx_core:GetPlayer(_source)
    if not player then
        return {
            success = false,
            error = "No player."
        }
    end

    local raceId = data.id -- <--- tu récupères ici l'id de la course
    if not raceId then
        return {
            success = false,
            error = "No race id."
        }
    end

    -- Cherche la course
    local race = MySQL.single.await('SELECT registeredPlayers FROM skulrag_races_races WHERE id = ?', {raceId})
    if not race then
        return {
            success = false,
            error = "Race not found."
        }
    end

    -- registeredPlayers = JSON d'une liste d'identifiants ou table Lua
    local currentPlayers = {}
    if race.registeredPlayers and race.registeredPlayers ~= '' then
        local decoded = json.decode(race.registeredPlayers)
        if type(decoded) == "table" then
            currentPlayers = decoded
        end
    end

    -- Empêche l'inscription 2 fois
    for _, v in ipairs(currentPlayers) do
        if v == player.PlayerData.citizenid then
            return {
                success = false,
                error = "Already registered."
            }
        end
    end

    -- Ajoute le joueur
    table.insert(currentPlayers, player.PlayerData.citizenid)

    -- Mets à jour la BDD
    local affectedRows = MySQL.update.await('UPDATE skulrag_races_races SET registeredPlayers = ? WHERE id = ?',
        {json.encode(currentPlayers), raceId})

    return {
        success = affectedRows > 0
    }
end)

lib.callback.register('__sk_races:postUnregisterFromRace', function(source, data)
    local _source = source
    local player = exports.qbx_core:GetPlayer(_source)
    if not player then
        return {
            success = false,
            error = "No player."
        }
    end

    local raceId = data.id -- ID de la course concernée
    if not raceId then
        return {
            success = false,
            error = "No race id."
        }
    end

    -- Cherche la course
    local race = MySQL.single.await('SELECT registeredPlayers FROM skulrag_races_races WHERE id = ?', {raceId})
    if not race then
        return {
            success = false,
            error = "Race not found."
        }
    end

    -- Décodage de la liste des joueurs inscrits
    local currentPlayers = {}
    if race.registeredPlayers and race.registeredPlayers ~= '' then
        local decoded = json.decode(race.registeredPlayers)
        if type(decoded) == "table" then
            currentPlayers = decoded
        end
    end

    -- Recherche et suppression du joueur
    local found = false
    for i = #currentPlayers, 1, -1 do
        if currentPlayers[i] == player.PlayerData.citizenid then
            table.remove(currentPlayers, i)
            found = true
            break
        end
    end

    if not found then
        return {
            success = false,
            error = "Player not registered."
        }
    end

    -- Mise à jour de la BDD
    local affectedRows = MySQL.update.await('UPDATE skulrag_races_races SET registeredPlayers = ? WHERE id = ?',
        {json.encode(currentPlayers), raceId})

    return {
        success = affectedRows > 0
    }
end)

lib.callback.register('__sk_races:getRacesHistory', function(source, cb)
    local _source = source
    local player = exports.qbx_core:GetPlayer(_source)
    if not player then
        return {
            success = false,
            error = "No player."
        }
    end
    local result = {}

    -- Récupérer les courses depuis la table skulrag_races_history
    local history = MySQL.query.await('SELECT * FROM skulrag_races_history ORDER BY date DESC')

    print(json.encode(history))

    for _, race in ipairs(history) do
        -- Récupérer le nom de l'initiateur
        local initiator = MySQL.scalar.await('SELECT pseudo FROM skulrag_races_users WHERE identifier = ?',
            {race.initiator})
        local winner = nil

        -- Récupérer les résultats des participants
        local results = {}

        if race.isFinished then
            for _, participant in ipairs(json.decode(race.finishers)) do
                local participantPseudo = MySQL.scalar.await(
                    'SELECT pseudo FROM skulrag_races_users WHERE identifier = ?', {participant.identifier})

                table.insert(results, {
                    rank = participant.rank,
                    pseudo = participantPseudo,
                    elapsed = participant.elapsedTime
                })

                if participant.rank == 1 then
                    winner = participantPseudo
                end
            end
        end

        -- Ajouter la course au résultat final
        table.insert(result, {
            id = race.raceId,
            name = race.trackName,
            date = ToFrDate(race.date),
            isFinished = race.isFinished,
            isRunning = race.isStarted,
            isCanceled = race.isCanceled,
            initiator = initiator,
            winner = winner,
            cashprize = race.cashprize,
            owner = race.initiator == player.PlayerData.citizenid,
            results = results
        })
        print(json.encode(result))

    end

    return result
end)

lib.callback.register('__sk_races:postCancelRace', function(src, raceId)
    local player = exports.qbx_core:GetPlayer(src)
    if not player then
        lib.notify({
            title = 'System',
            description = "Tu n'es pas connecté.",
            type = 'error'
        }, src)
        return
    end

    if not raceId then
        lib.notify({
            title = 'System',
            description = "Usage: /sk_cancelRace <raceId>",
            type = 'error'
        }, src)
        return
    end

    -- Chercher la course
    local race = MySQL.single.await('SELECT * FROM skulrag_races_races WHERE id = ?', {raceId})
    if not race then
        lib.notify({
            title = 'System',
            description = "Course non trouvée.",
            type = 'error'
        }, src)
        return
    end

    -- Vérifier ownership
    if race.identifier ~= player.PlayerData.citizenid then
        lib.notify({
            title = 'System',
            description = "Tu n'es pas le propriétaire de cette course !",
            type = 'error'
        }, src)
        return
    end

    -- Supprimer la course
    local affectedRows = MySQL.update.await('DELETE FROM skulrag_races_races WHERE id = ?', {raceId})
    if affectedRows and affectedRows > 0 then
        lib.notify({
            title = 'System',
            description = "Course supprimée avec succès.",
            type = 'success'
        }, src)

        -- Met à jour l’historique : annulation
        local ok, err = pcall(function()
            MySQL.update.await('UPDATE skulrag_races_history SET isCanceled = 1 WHERE raceId = ?', {raceId})
        end)
        if not ok then
            print("[HISTORY] Erreur MAJ annulation historique :", err)
        end

        -- Notifier tous les participants, si il y en a
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
                -- Tu dois définir ToFrDate si besoin (formatage FR date)
                local displayDate = race.date
                if ToFrDate ~= nil then
                    displayDate = ToFrDate(race.date)
                end
                TriggerClientEvent("__sk_races:raceCanceled", target.PlayerData.source, displayDate)
            end
        end
    else
        lib.notify({
            title = 'System',
            description = "Erreur : Impossible de supprimer la course.",
            type = 'error'
        }, src)
    end
end)

lib.callback.register('__sk_races:postStartRace', function(src, data)
    local player = exports.qbx_core:GetPlayer(src)
    if not player then
        print("NOT PLAYER")
        lib.notify({
            title = 'System',
            description = "Tu n'es pas connecté.",
            type = 'error',
            position = 'top'
        }, src)
        return
    end

    -- Chercher la course
    local raceId = data.id
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

