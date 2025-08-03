local function checkpointToVector(checkpoint)
    if checkpoint.x and checkpoint.y and checkpoint.z then
        return vector3(checkpoint.x, checkpoint.y, checkpoint.z)
    elseif #checkpoint == 3 then
        return vector3(checkpoint[1], checkpoint[2], checkpoint[3])
    elseif type(checkpoint) == "vector3" then
        return checkpoint
    else
        error("Format de checkpoint inconnu: " .. tostring(checkpoint))
    end
end

RegisterNetEvent("__sk_races:addCheckpointToTrack", function(trackId, x, y, z)
    local src = source
    print(("Joueur %d veut ajouter un checkpoint à la piste %d sur : x=%.2f y=%.2f z=%.2f"):format(src, trackId, x, y,
        z))
    local track = MySQL.single.await('SELECT * FROM skulrag_races_tracks WHERE id = ?', {trackId})

    local checkpoints = json.decode(track.checkpoints) or {}
    local prevCheckpoint = checkpoints[#checkpoints]
    local distanceToAdd = 0.0
    if prevCheckpoint ~= nil then
        local prevVec = checkpointToVector(prevCheckpoint)
        distanceToAdd = #(vector3(x, y, z) - prevVec)
    end

    table.insert(checkpoints, {
        x = x,
        y = y,
        z = z
    })

    local newTotalDistance = (tonumber(track.distance) or 0) + distanceToAdd

    MySQL.update.await('UPDATE skulrag_races_tracks SET checkpoints = ?, distance = ? WHERE id = ?',
        {json.encode(checkpoints), newTotalDistance, trackId})
    print(("Checkpoint sauvegardé ! Nouvelle distance totale : %.2f m (+%.2f m ajoutés)"):format(newTotalDistance,
        distanceToAdd))
end)

RegisterNetEvent("__sk_races:postPlayerFinishedRace")
AddEventHandler("__sk_races:postPlayerFinishedRace", function(raceId)
    local src = source
    local Player = exports.qbx_core:GetPlayer(src)
    if not Player then
        print("Joueur non trouvé")
        return
    end
    local citizenid = Player.PlayerData.citizenid

    MySQL.update([[UPDATE skulrag_races_races
        SET finishedPlayers = JSON_ARRAY_APPEND(finishedPlayers, '$', ?)
        WHERE id = ? AND JSON_CONTAINS(finishedPlayers, JSON_QUOTE(?), '$') = 0]], {citizenid, raceId, citizenid},
        function(_)
            -- Lecture de la liste des inscrits et des finishers :
            MySQL.query('SELECT finishedPlayers, registeredPlayers FROM skulrag_races_races WHERE id = ?', {raceId},
                function(results)
                    if not results or not results[1] then
                        TriggerClientEvent("__sk_races:positionNotification", src, false)
                        return
                    end
                    local finished = results[1].finishedPlayers or '[]'
                    local registered = results[1].registeredPlayers or '[]'
                    local finishedTable = json.decode(finished)
                    local registeredTable = json.decode(registered)

                    -- Calcul de la position d'arrivée
                    local pos = nil
                    for i, v in ipairs(finishedTable) do
                        if v == citizenid then
                            pos = i
                            break
                        end
                    end
                    if pos then
                        TriggerClientEvent("__sk_races:positionNotification", src, pos)
                        if pos == 1 then
                            MySQL.update("UPDATE skulrag_races_races SET firstFinisher = ? WHERE id = ?",
                                {citizenid, raceId})
                        end
                    else
                        TriggerClientEvent("__sk_races:positionNotification", src, false)
                    end

                    -- Si tout le monde a fini, on marque la course terminée
                    if #finishedTable > 0 and #registeredTable > 0 and #finishedTable == #registeredTable then
                        MySQL.update("UPDATE skulrag_races_races SET isFinished = 1 WHERE id = ?", {raceId})
                        -- Ici tu peux, si tu le veux, broadcast à tous
                        TriggerClientEvent("__sk_races:raceFinished", -1)
                    end
                end)
        end)
end)

