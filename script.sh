read -p "Enter website URL: " url

# Ensure URL is provided
if [ -z "$url" ]; then
    echo "URL not provided. Exiting."
    exit 1
fi

bun index.ts "$url"
