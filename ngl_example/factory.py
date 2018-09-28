import logging

from flask import Flask

_log = logging.getLogger(__name__)

def create_app(settings=None):
    _log.info("Creating flask app")

    app = Flask(__name__, static_folder='presentation/web/static', static_url_path='/static',
               template_folder='presentation/web/templates')

    # Ignore Flask's built-in logging
    # app.logger is accessed here so Flask tries to create it
    app.logger_name = "nowhere"
    app.logger

    # Configure logging.
    #
    # It is somewhat dubious to get _log from the root package, but I can't see
    # a better way. Having the email handler configured at the root means all
    # child loggers inherit it.
    from ngl_example import _log as ngl_example_logger

    # Only log to the console during development and production, but not during
    # testing.
    if app.testing:
        ngl_example_logger.setLevel(logging.DEBUG)
    else:
        ch = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s - %(levelname)s - %(message)s')
        ch.setFormatter(formatter)
        ngl_example_logger.addHandler(ch)

        if app.debug:
            ngl_example_logger.setLevel(logging.DEBUG)
        else:
            ngl_example_logger.setLevel(logging.INFO)

    # Specify the Blueprints
    from ngl_example.presentation.web.routes import bp as web_bp

    # Register the Blueprints
    app.register_blueprint(web_bp)

    return app