import { clc } from "./colors.js";

const ERRORS = [
    { "name": "not_a_file", "message": "'%&%' is not a file" },
    { "name": "not_found", "message": "'%&%' not found" },
    { "name": "missing_operands", "message": "missing operands" },
    { "name": "many_operands", "message": "too many operands" },
    { "name": "many_flags", "message": "too many flags" },
    { "name": "wrong_type", "message": "invalid entry type" },
    { "name": "perms_denied", "message": "permissions denied" },
    { "name": "unknown_type", "message": "unknown entry type" },
    { "name": "invalid_format", "message": "invalid format. %&%" },
    { "name": "corrupted", "message": "'%&%' corrupted" },
    { "name": "wrong_file_type", "message": "invalid file type. Expected a '%&%' file" },
    { "name": "internal_error", "message": "an internal command error occurred. %&%" },
    { "name": "already_exist", "message": "'%&%' already exist" },
    { "name": "not_empty", "message": "'%&%' is not empty" },
    { "name": "failed_fetch", "message": "failed to fetch '%&%'" },
    { "name": "error_404", "message": "HTTP status %&%" },
]
export const error = {}
ERRORS.forEach(err => {
    if (err.message.includes('%&%')) error[err.name] = (text) => { return clc.red(`ERROR: ${err.message}.`).replace('%&%', text) };
    else error[err.name] = clc.red(`ERROR: ${err.message}.`)
});