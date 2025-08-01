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
        return MySQL.scalar.await('SELECT pseudo FROM `skulrag_races_users` WHERE identifier = ?', {player.PlayerData.citizenid})
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
    local id = pcall(function()
        return MySQL.insert.await('INSERT INTO `skulrag_races_tracks` (identifier, name, type) VALUES (?, ?, ?)',
            {player.PlayerData.citizenid, name, type})
    end)
    if not id then
        return {
            ['success'] = false,
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
        return MySQL.query.await('DELETE FROM `skulrag_races_tracks` WHERE id = ?',
            {id})
    end)
    print(result);
    return result;
end)