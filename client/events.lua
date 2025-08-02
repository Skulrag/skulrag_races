local checkpoints = {}
local currentCheckpoint = 1
local laps = 1
local totalLaps = 1
local trackType = "sprint" -- ou "laps"
local gpsRouteActive = false
local checkpointBlip = nil
local checkpointObj = nil

RegisterNetEvent("__sk_races:startRace", function(race)
    -- Joue un son d'alerte fort
    PlaySoundFrontend(-1, "TIMER_STOP", "HUD_MINI_GAME_SOUNDSET", true)

    -- Affiche "RACE STARTING" pendant 10 secondes
    Citizen.CreateThread(function()
        local timer = GetGameTimer() + 10000
        while GetGameTimer() < timer do
            DrawMissionText("~y~RACE STARTING!", 100)
            Wait(0)
        end
    end)

    checkpoints = race.checkpoints or {}
    currentCheckpoint = 1
    totalLaps = race.laps or 1
    laps = 1
    trackType = race.trackType -- soit 'sprint', soit 'laps'

    -- Génération de la liste complète des points GPS pour toute la course
    ClearGpsMultiRoute()
    SetWaypointOff()
    Wait(50)

    StartGpsMultiRoute(47, true, true)

    for lap = 1, totalLaps do
        for i, cp in ipairs(checkpoints) do
            AddPointToGpsMultiRoute(vector3(cp.x, cp.y, cp.z))
        end
    end

    -- Ajout du checkpoint 1 EN PLUS à la toute fin (arrivée, même si déjà dans la boucle)
    if #checkpoints > 0 then
        AddPointToGpsMultiRoute(vector3(checkpoints[1].x, checkpoints[1].y, checkpoints[1].z))
    end

    Wait(100)
    SetGpsMultiRouteRender(true)
    gpsRouteActive = true

    -- Place le premier checkpoint 3D
    setRaceCheckpoint(currentCheckpoint, laps, totalLaps)

    -- Lance le handler principal
    Citizen.CreateThread(raceMainLoop)
end)

function DrawMissionText(text, duration)
    SetTextEntry_2("STRING")
    AddTextComponentString(text)
    DrawSubtitleTimed(duration or 1000, 1)
end

function setRaceCheckpoint(idx, laps, totalLaps)
    -- Nettoyage si existants
    if checkpointObj then
        DeleteCheckpoint(checkpointObj)
    end
    if checkpointBlip then
        RemoveBlip(checkpointBlip)
    end

    if idx == nil then
        return
    end

    local cp = checkpoints[idx]
    local type = 47 -- Général

    -- CP de début ou arrivée : si laps, c'est le premier cp, début OU tout dernier "arrivée"
    if idx == 1 and (laps == 1 or laps > totalLaps) then
        type = 4 -- Départ/Arrivée visuel
    end

    checkpointObj = CreateCheckpoint(type, cp.x, cp.y, cp.z, 0, 0, 0, 10.0, 0, 255, 0, 20, 0)
    checkpointBlip = AddBlipForCoord(cp.x, cp.y, cp.z)
    SetBlipColour(checkpointBlip, 2)
end

function raceMainLoop()
    while true do
        local ped = PlayerPedId()
        local pos = GetEntityCoords(ped)
        local cp = checkpoints[currentCheckpoint]
        local dist = #(pos - vector3(cp.x, cp.y, cp.z))

        if dist < 7.0 then
            PlaySoundFrontend(-1, "CHECKPOINT_NORMAL", "HUD_MINI_GAME_SOUNDSET", true)
            -- Checkpoint validé
            setRaceCheckpoint(nil)

            if trackType == "laps" then
                if laps <= totalLaps then
                    -- Tours normaux
                    if laps <= totalLaps and currentCheckpoint < #checkpoints then
                        currentCheckpoint = currentCheckpoint + 1
                    elseif currentCheckpoint == #checkpoints then
                        laps = laps + 1
                        currentCheckpoint = 1
                    end
                else
                    -- DERNIER TOUR
                    -- On vient de repasser sur CP1 juste après la boucle = ARRIVEE!
                    print('FINI LAPS')
                    break
                end
            else
                -- mode sprint
                if currentCheckpoint == #checkpoints then
                    print('FINI SPRINT')
                    break
                end
                currentCheckpoint = currentCheckpoint + 1
            end

            setRaceCheckpoint(currentCheckpoint, laps, totalLaps)
        end
        Wait(0)
    end
    -- Nettoyage (fin de course)
    if checkpointObj then
        DeleteCheckpoint(checkpointObj)
    end
    if checkpointBlip then
        RemoveBlip(checkpointBlip)
    end
    SetGpsMultiRouteRender(false)
    gpsRouteActive = false

    DrawMissionText("~g~FINISH!", 3000)
    PlaySoundFrontend(-1, "RACE_PLACED", "HUD_AWARDS", true)
end

-- Écoute de l'événement d'annulation de la course
RegisterNetEvent("__sk_races:raceCanceled", function(raceDate)
    local message = "Course du " .. raceDate .. " est annulée."
    -- Afficher la notification pendant 20 secondes
    exports.qbx_core:Notify(message, 'error', 20000)
end)

