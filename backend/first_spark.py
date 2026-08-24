"""First Spark: a tiny terminal agent for AirAware.

Takes one outdoor plan typed by Christy, sends it to the model, and prints
a short first recommendation. No tools, no cloud setup, terminal only.
"""

from agent import ask_model, get_credentials


def main() -> None:
    api_key, api_url, model, missing = get_credentials()
    if missing:
        print(f"Missing from backend/.env: {', '.join(missing)}")
        return

    plan = input("Describe your outdoor plan: ").strip()
    if not plan:
        print("No plan entered.")
        return

    reply = ask_model(plan, api_key, api_url, model)
    print(reply)


if __name__ == "__main__":
    main()
