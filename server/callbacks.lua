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
        print('message', message)
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
    print(result);
    return result;
end)

lib.callback.register('__sk_races:deleteTrack', function(source, data)
    local id = data.track.id
    print('ID', id)
    local result = pcall(function()
        return MySQL.query.await('DELETE FROM `skulrag_races_tracks` WHERE id = ?', {id})
    end)
    print(result);
    return result;
end)

lib.callback.register('__sk_races:postCreateRace', function(source, data)
    local _source = source
    local player = exports.qbx_core:GetPlayer(_source)
    local id, message = pcall(function()
        return MySQL.insert.await(
            'INSERT INTO `skulrag_races_races` (identifier, trackId, type, date, laps, cashprize, entries) VALUES (?, ?, ?, ?, ?, ?, ?)',
            {player.PlayerData.citizenid, data.trackId, data.type, isoToMySQLDate(data.date), data.laps, data.cashprize, data.entries})
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

    print('data.finished', data.finished)
    print('data.owned', data.owned)
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
        local isOnline = false
        local timestamp

        -- Convertit le champ en string ou number vers secondes
        if row.date then
            -- Si string, convertir en nombre
            local num = tonumber(row.date)
            if num then
                -- timestamp en millisecondes → secondes
                timestamp = math.floor(num / 1000)
                isOnline = timestamp > currentTime
            end
        end

        row.isOnline = isOnline
        print('row.isOnline', row.isOnline)

        print('row.entries', row.entries)
        print('#row.registeredPlayers', #row.registeredPlayers)

        row.entriesLeft = row.entries - #row.registeredPlayers
    end

    return result
end)

