import datetime
import logging
import argparse
import google.generativeai as genai

def get_ordinal_suffix(day):
    suffixes = ['th', 'st', 'nd', 'rd']
    relevant_digits = day if day < 30 else day % 30
    return suffixes[relevant_digits if relevant_digits <= 3 else 0]

def format_current_time():
    now = datetime.datetime.now()
    day = now.day
    day_with_suffix = f"{day}{get_ordinal_suffix(day)}"
    formatted_time = now.strftime(f"%d %B %A %I:%M %p").replace(now.strftime('%d'), day_with_suffix)
    return formatted_time

def generate_content(api_key, temperature, time):
    logging.info(f"Generating content with time: {time}")

    if not api_key:
        raise ValueError("API key is not set in the configuration")

    genai.configure(api_key=api_key)

    # Set up the model
    generation_config = {
        "temperature": temperature,
        "top_p": 0.95,
        "top_k": 64,
        "max_output_tokens": 8192,
    }

    safety_settings = [
        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
    ]

    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        generation_config=generation_config,
        safety_settings=safety_settings
    )

    prompt_parts = [
        "input: 30th January Thursday 5am",
        "output: you're an early bird, its cold ain't it?",
        "input: 1st January Friday 6am",
        "output: hey there good morning, how's the new year party going on",
        "input: 14th February Saturday 7am",
        "output: please tell me you got a date today",
        "input: 15th August Thursday 8am",
        "output: good morning dear, looking good",
        "input: 22nd July Tuesday 10:30am",
        "output: ready for a brunch?",
        "input: 13th August Wednesday 3:45pm",
        "output: how are you loving the weather?",
        "input: 2nd March Monday 12pm",
        "output: don't forget to drink some water",
        "input: 4th April Thursday 5pm",
        "output: how's your day so far babe?",
        "input: 7th September Friday 1:33pm",
        "output: good afternoon beautiful",
        "input: 8th October Saturday 5:55pm",
        "output: how was your day so far",
        "input: 19th September Sunday 4:43 pm",
        "output: good evening, wanna go for a ride?",
        "input: 12th January Monday 7pm",
        "output: hey there",
        "input: 23rd July Friday 6pm",
        "output: hey there looking pale, everything alright? It's okay, tomorrow is the weekend",
        "input: 4th May Saturday 9am",
        "output: may the forth be with you, live long and prosper",
        "input: 29th May Friday 6 PM",
        "output: hi there, I hope you're doing okay?",
        "input: 6th April Monday 7:23 PM",
        "output: ready for dinner?",
        "input: 15th June Friday 11 PM",
        "output: work hard, party hard",
        "input: 27th July Wednesday 11 PM",
        "output: ready to burn the midnight oil?",
        "input: 10th August Friday 6 PM",
        "output: work hard today for a better tomorrow",
        "input: 14th September Friday 1:55 AM",
        "output: it's late, go to bed",
        "input: 9th October Friday 1:00 AM",
        "output: good night, sleep tight, don't let the bed bugs bite.",
        "input: 29th January Friday 6 PM",
        "output: it's cold isn't it",
        "input: 29th March Friday 6 PM",
        "output: what a beautiful day to be alive",
        "input: 29th August Friday 10am",
        "output: how's the spring treating you so far?",
        "input: 23rd October Monday 6am",
        "output: the month of festivals, wow",
        "input: 7th February Monday 2pm",
        "output: is your Monday Mondaying?",
        "input: 29th May Friday 6 PM",
        "output: go to church or go to hell?",
        "input: 30th May Thursday 11:19 PM",
        "output: how was your day",
        "input: 29th May Friday 6 PM",
        "output: you need to seriously get a life",
        "input: 25th December Wednesday 11:19 PM",
        "output: hey there merry Christmas",
        "input: 1st January Friday 6pm",
        "output: ",
    ]

    response = model.generate_content(prompt_parts)
    generated_text = response.text
    logging.info(f"Generated Content: {generated_text}")
    return generated_text

def main():
    parser = argparse.ArgumentParser(description='Generate content based on the provided time.')
    parser.add_argument('--api_key', type=str, required=True, help='Google API key')
    parser.add_argument('--temperature', type=float, default=0.95, help='Temperature for content generation')
    parser.add_argument('--time', type=str, required=True, help='Time input for content generation')
    args = parser.parse_args()

    try:
        generated_content = generate_content(args.api_key, args.temperature, args.time)
        print(generated_content)
    except Exception as e:
        logging.error(f"Error generating content: {e}")
        print(f"Error: {e}", file=sys.stderr)

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    main()
