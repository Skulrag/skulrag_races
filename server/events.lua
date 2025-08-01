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
    print(("Joueur %d veut ajouter un checkpoint à la piste %d sur : x=%.2f y=%.2f z=%.2f"):format(src, trackId, x, y, z))
    local track = MySQL.single.await('SELECT * FROM skulrag_races_tracks WHERE id = ?', {trackId})

    local checkpoints = json.decode(track.checkpoints) or {}
    local prevCheckpoint = checkpoints[#checkpoints]
    local distanceToAdd = 0.0
    if prevCheckpoint ~= nil then
        local prevVec = checkpointToVector(prevCheckpoint)
        distanceToAdd = #(vector3(x, y, z) - prevVec)
    end

    table.insert(checkpoints, {x = x, y = y, z = z})

    local newTotalDistance = (tonumber(track.distance) or 0) + distanceToAdd

    MySQL.update.await(
        'UPDATE skulrag_races_tracks SET checkpoints = ?, distance = ? WHERE id = ?',
        {json.encode(checkpoints), newTotalDistance, trackId}
    )
    print(("Checkpoint sauvegardé ! Nouvelle distance totale : %.2f m (+%.2f m ajoutés)"):format(newTotalDistance, distanceToAdd))
end)