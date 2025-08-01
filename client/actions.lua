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
    print('SK_RACES WAITING FOR LOADED PLAYER...')
    Citizen.Wait(3000)
  end
  local result = lib.callback.await('__sk_races:getPseudo', false, data)
  cb(result)
end)

RegisterNUICallback('__sk_races:postCreateTrack', function(data, cb)
  while not playerLoaded do
    print('SK_RACES WAITING FOR LOADED PLAYER...')
    Citizen.Wait(3000)
  end
  local result = lib.callback.await('__sk_races:postCreateTrack', false, data)
  cb(result)
end)

RegisterNUICallback('__sk_races:getTracks', function(data, cb)
  while not playerLoaded do
    print('SK_RACES WAITING FOR LOADED PLAYER...')
    Citizen.Wait(3000)
  end
  local result = lib.callback.await('__sk_races:getTracks', false)
  cb(result)
end)

RegisterNUICallback('__sk_races:deleteTrack', function(data, cb)
  while not playerLoaded do
    print('SK_RACES WAITING FOR LOADED PLAYER...')
    Citizen.Wait(3000)
  end
  local result = lib.callback.await('__sk_races:deleteTrack', false, data)
  cb(result)
end)

RegisterNUICallback('__sk_races:postCreateRace', function(data, cb)
  while not playerLoaded do
    print('SK_RACES WAITING FOR LOADED PLAYER...')
    Citizen.Wait(3000)
  end
  local result = lib.callback.await('__sk_races:postCreateRace', false, data)
  cb(result)
end)

RegisterNUICallback('__sk_races:getRaces', function(data, cb)
  while not playerLoaded do
    print('SK_RACES WAITING FOR LOADED PLAYER...')
    Citizen.Wait(3000)
  end
  local result = lib.callback.await('__sk_races:getRaces', false, data)
  cb(result)
end)