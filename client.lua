RegisterCommand('openui', function()
    SetNuiFocus(true, true)
    SendNUIMessage({
        type = "open",
        message = "Salut depuis Lua via Vite !"
    })
end)

RegisterNUICallback('doAction', function(data, cb)
    print('Action reçue depuis UI/Vite !')
    print(json.encode(data))
    cb({result = "Succès côté LUA!"})
end)

RegisterNUICallback('closeUI', function(data, cb)
    SetNuiFocus(false, false)
    cb({})
end)