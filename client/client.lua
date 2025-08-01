RegisterCommand('openui', function()
    SetNuiFocus(true, true)
    SendNUIMessage({
        action = "skulrag_races_setVisible",
        data = true
    })
end)

RegisterNUICallback('skulrag_races_hideFrame', function(data, cb)
    SetNuiFocus(false, false)
    SendNUIMessage({
        action = "skulrag_races_setVisible",
        data = false
    })
    if cb then cb({}) end
end)

RegisterCommand("sk_addcheckpoint", function(source, args, rawCommand)
    -- Vérifie si un id est fourni
    local trackId = tonumber(args[1])
    if not trackId then
        print("Usage: /sk_addcheckpoint <id>")
        return
    end

    -- Récupère la position du joueur
    local playerPed = PlayerPedId()
    local position = GetEntityCoords(playerPed)

    -- Envoie au serveur
    TriggerServerEvent("__sk_races:addCheckpointToTrack", trackId, position.x, position.y, position.z)
end, false)