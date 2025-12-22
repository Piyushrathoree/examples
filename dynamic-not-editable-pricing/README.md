![](../logo.svg)

# Dynamic Not Editable Pricing

This FastAPI application creates dynamic pricing products with Polar integration. It uses [ad-hoc prices](https://polar.sh/docs/features/checkout/session#ad-hoc-prices).

## Prerequisites

- Python 3+ installed on your system
- Your Polar API key (Organization Access Token)

## Setup

1. Clone the directory:

```bash
npx degit polarsource/examples/dynamic-not-editable-pricing ./dynamic-not-editable-pricing
```

2. Create a virtual environment

```bash
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Configure environment variables:

Create a `.env` file in the project root with your credentials:

```bash
cp .env.example .env
```

Add your credentials to the `.env` file:

```
POLAR_API_KEY=your_polar_oat_here
```

You can find your API key in your Polar's Organization settings.

## Usage

Start the FastAPI server:

```bash
fastapi dev main.py
```

The application will be available at `http://localhost:8000`.
