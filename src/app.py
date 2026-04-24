from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user, login_required
from werkzeug.security import generate_password_hash, check_password_hash
import secrets

app = Flask("__name__")
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///test.db"
app.secret_key = secrets.token_hex(32)

db = SQLAlchemy(app)

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True ,nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    session_id = db.Column(db.Integer, db.ForeignKey("session.id"))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'

class Session(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    num_rows = db.Column(db.Integer, nullable=False)
    num_cols = db.Column(db.Integer, nullable=False)
    values = db.Column(db.JSON)
    
    def __repr__(self):
        return f'<Rows: {self.num_rows}, Cols: {self.num_cols}>'

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "/login"

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route("/")
@login_required
def index():
    user : User = current_user
    # session : Session = Session.query.get(user.session_id)
    return render_template(
        'index.html',
        name=user.username,
    )

@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        username = request.form["username"]
        password_hash = generate_password_hash(request.form["password"])

        session = Session(num_rows=0, num_cols=0, values="{}")
        db.session.add(session)
        db.session.flush()

        user = User(username=username, password_hash=password_hash, session_id=session.id)
        db.session.add(user)
        db.session.commit()

        if user:
            login_user(user)
            return redirect("/")
    return render_template('userform.html', title="Sign Up", url="/signup")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            login_user(user)
            return redirect('/')
    return render_template('userform.html', title="Login", url="/login")

@app.route("/logout")
def logout():
    logout_user()
    return redirect()

# with app.app_context():
#     db.create_all()
