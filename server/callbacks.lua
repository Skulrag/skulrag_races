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
    local id, message = pcall(function()
        return MySQL.insert.await(
            'INSERT INTO `skulrag_races_races` (identifier, trackId, type, date, laps, cashprize, entries) VALUES (?, ?, ?, ?, ?, ?, ?)',
            {player.PlayerData.citizenid, data.trackId, data.type, isoToMySQLDate(data.date), data.laps, data.cashprize,
             data.entries})
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

lib.callback.register('__sk_races:getRaces', function(source, data)
    local _source = source
    local player = exports.qbx_core:GetPlayer(_source)

    local filters = {}
    local params = {}

    if data.finished then
        table.insert(filters, '`r`.`date` < NOW()')
    end

    if data.owned then
        table.insert(filters, '`r`.`identifier` = ?')
        table.insert(params, player.PlayerData.citizenid)
    end

    local whereClause = (#filters > 0) and ("WHERE " .. table.concat(filters, " AND ")) or ""

    local sql = [[
    SELECT r.*, u.pseudo
    FROM skulrag_races_races r
    LEFT JOIN skulrag_races_users u ON r.identifier = u.identifier
    ]] .. whereClause .. [[
    ORDER BY r.date DESC
    ]]

    local bool, result = pcall(function()
        return MySQL.query.await(sql, params)
    end)

    -- Ajoute "isOnline" à chaque course selon la date
    local currentTime = os.time()
    for i, row in ipairs(result) do
        -- isOnline
        local isOnline = false
        local timestamp
        if row.date then
            local num = tonumber(row.date)
            if num then
                timestamp = math.floor(num / 1000)
                isOnline = timestamp > currentTime
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
    local affectedRows = MySQL.update.await(
        'UPDATE skulrag_races_races SET registeredPlayers = ? WHERE id = ?',
        {json.encode(currentPlayers), raceId}
    )

    return {
        success = affectedRows > 0
    }
end)
