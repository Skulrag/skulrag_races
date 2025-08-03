function isoToMySQLDate(dateStr)
    -- "2025-08-01T13:45:00.803Z" -> "2025-08-01 13:45:00"
    return dateStr:sub(1,19):gsub("T", " ")
end

function ToFrDate(date)
    if tonumber(date) ~= nil then
        local ts = tonumber(date)
        -- Si plus de 12 chiffres, probablement en ms, convertis en secondes
        if ts > 1e12 then
            ts = math.floor(ts / 1000)
        end
        local d = os.date("*t", ts)
        if d then
            return string.format("%02d/%02d/%04d à %02d:%02d", d.day, d.month, d.year, d.hour, d.min)
        else
            return tostring(date)
        end
    elseif type(date) == "string" then
        local y, m, d, h, min = date:match("(%d+)%-(%d+)%-(%d+) (%d+):(%d+)")
        if y and m and d and h and min then
            return string.format("%s/%s/%s à %s:%s", d, m, y, h, min)
        else
            local y, m, d = date:match("(%d+)%-(%d+)%-(%d+)")
            if y and m and d then
                return string.format("%s/%s/%s", d, m, y)
            else
                return tostring(date)
            end
        end
    else
        return tostring(date)
    end
end

function getDateStr(date)
    local ts = tonumber(date)
    if ts and ts > 1e12 then
        ts = math.floor(ts / 1000)
    end
    local d = os.date("*t", ts or 0)
    return string.format("%04d-%02d-%02d", d.year, d.month, d.day)
end

function getDatePartsFromTimestampMs(ts)
    if not ts then return nil end
    -- Retirer le ".0" éventuel au cas où ce soit une string
    ts = tonumber(ts)
    if not ts then return nil end
    local s = math.floor(ts / 1000)
    return os.date("*t", s).year, os.date("*t", s).month, os.date("*t", s).day
end




