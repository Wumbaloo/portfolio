def get_fields(params, fields):
    error = ""
    success = {}
    for param in params:
        getter = fields.get(param)
        if not getter or getter == None:
            error += param + ','
        else:
            success[param] = getter
    if len(error) != 0:
        error = error[:-1]
        return False, error
    return True, success
