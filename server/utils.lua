function isoToMySQLDate(dateStr)
    -- "2025-08-01T13:45:00.803Z" -> "2025-08-01 13:45:00"
    return dateStr:sub(1,19):gsub("T", " ")
end
