local playerLoaded = QBX.PlayerData.source ~= nil
AddEventHandler('QBCore:Client:OnPlayerLoaded', function() 
  playerLoaded = true
end)

RegisterNUICallback('__sk_races:postPseudoForm', function(data, cb)
  local result = lib.callback.await('__sk_races:registerPlayer', false, data)
  cb(result)
end)

RegisterNUICallback('__sk_races:getPseudo', function(data, cb)
  while not playerLoaded do
    Citizen.Wait(3000)
  end
  local result = lib.callback.await('__sk_races:getPseudo', false, data)
  cb(result)
end)

RegisterNUICallback('__sk_races:postCreateTrack', function(data, cb)
  while not playerLoaded do
    Citizen.Wait(3000)
  end
  local result = lib.callback.await('__sk_races:postCreateTrack', false, data)
  cb(result)
end)

RegisterNUICallback('__sk_races:getTracks', function(data, cb)
  while not playerLoaded do
    Citizen.Wait(3000)
  end
  local result = lib.callback.await('__sk_races:getTracks', false)
  cb(result)
end)

RegisterNUICallback('__sk_races:deleteTrack', function(data, cb)
  while not playerLoaded do
    Citizen.Wait(3000)
  end
  local result = lib.callback.await('__sk_races:deleteTrack', false, data)
  cb(result)
end)

RegisterNUICallback('__sk_races:postCreateRace', function(data, cb)
  while not playerLoaded do
    Citizen.Wait(3000)
  end
  local result = lib.callback.await('__sk_races:postCreateRace', false, data)
  cb(result)
end)

RegisterNUICallback('__sk_races:getRaces', function(data, cb)
  while not playerLoaded do
    Citizen.Wait(3000)
  end
  local result = lib.callback.await('__sk_races:getRaces', false, data)
  cb(result)
end)

RegisterNUICallback('__sk_races:postRegisterToRace', function(data, cb)
  while not playerLoaded do
    Citizen.Wait(3000)
  end
  local result = lib.callback.await('__sk_races:postRegisterToRace', false, data)
  cb(result)
end)


RegisterNUICallback('__sk_races:postUnregisterFromRace', function(data, cb)
  while not playerLoaded do
    Citizen.Wait(3000)
  end
  local result = lib.callback.await('__sk_races:postUnregisterFromRace', false, data)
  cb(result)
end)


RegisterNUICallback('__sk_races:getRacesHistory', function(data, cb)
  while not playerLoaded do
    Citizen.Wait(3000)
  end
  local result = lib.callback.await('__sk_races:getRacesHistory', false)
  cb(result)
end)

RegisterNUICallback('__sk_races:postCancelRace', function(data, cb)
  while not playerLoaded do
    Citizen.Wait(3000)
  end
  local result = lib.callback.await('__sk_races:postCancelRace', false, data)
  cb(result)
end)

RegisterNUICallback('__sk_races:postStartRace', function(data, cb)
  while not playerLoaded do
    Citizen.Wait(3000)
  end
  local result = lib.callback.await('__sk_races:postStartRace', false, data)
  cb(result)
end)

RegisterNUICallback('__sk_races:deleteRace', function(data, cb)
  while not playerLoaded do
    Citizen.Wait(3000)
  end
  local result = lib.callback.await('__sk_races:deleteRace', false, data)
  cb(result)
end)