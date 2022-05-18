"use strict";
// Entry point for the app
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Express is the underlying that atlassian-connect-express uses:
// https://expressjs.com
const express_1 = __importDefault(require("express"));
// https://expressjs.com/en/guide/using-middleware.html
const body_parser_1 = __importDefault(require("body-parser"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const errorhandler_1 = __importDefault(require("errorhandler"));
const morgan_1 = __importDefault(require("morgan"));
// atlassian-connect-express also provides a middleware
const atlassian_connect_express_1 = __importDefault(require("atlassian-connect-express"));
// We also need a few stock Node modules
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const helmet_1 = __importDefault(require("helmet"));
const nocache_1 = __importDefault(require("nocache"));
// Routes live here; this is the C in MVC
const routes_1 = __importDefault(require("./routes"));
// Bootstrap Express and atlassian-connect-express
const app = (0, express_1.default)();
const addon = (0, atlassian_connect_express_1.default)(app);
const port = addon.config.port();
app.set("port", port);
// Log requests, using an appropriate formatter by env
const devEnv = app.get("env") === "development";
app.use((0, morgan_1.default)(devEnv ? "dev" : "combined"));
// Configure Handlebars
app.set("view engine", "hbs");
app.set("views", "./views");
// http://go.atlassian.com/security-requirements-for-cloud-apps
// HSTS must be enabled with a minimum age of at least one year
app.use(helmet_1.default.hsts({
    maxAge: 31536000,
    includeSubDomains: false,
}));
app.use(helmet_1.default.referrerPolicy({
    policy: ["origin"],
}));
// Include request parsers
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
// Gzip responses when appropriate
app.use((0, compression_1.default)());
// Include atlassian-connect-express middleware
app.use(addon.middleware());
// Mount the static files directory
const staticDir = path_1.default.join(__dirname, "public");
app.use(express_1.default.static(staticDir));
// Atlassian security policy requirements
// http://go.atlassian.com/security-requirements-for-cloud-apps
app.use((0, nocache_1.default)());
// Show nicer errors in dev mode
if (devEnv)
    app.use((0, errorhandler_1.default)());
// Wire up routes
(0, routes_1.default)(app, addon);
// Boot the HTTP server
http_1.default.createServer(app).listen(port, () => {
    console.log("App server running at http://" + os_1.default.hostname() + ":" + port);
    // Enables auto registration/de-registration of app into a host in dev mode
    if (devEnv)
        addon.register();
});
