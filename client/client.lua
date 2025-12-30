RegisterCommand('sk_openui', function()
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
